"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"

async function getSalonId() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Não autenticado")
    return session.user.id
}

export async function getTimeBlocks(date: Date) {
    noStore()
    const salonId = await getSalonId()
    const start = new Date(date); start.setHours(0, 0, 0, 0)
    const end = new Date(date); end.setHours(23, 59, 59, 999)
    return prisma.timeBlock.findMany({
        where: { salonId, date: { gte: start, lte: end } },
        include: { barber: { select: { id: true, name: true } } },
    })
}

export async function createTimeBlock(data: {
    barberId: string
    date: Date
    startTime: string
    endTime: string
    reason?: string
}) {
    try {
        const salonId = await getSalonId()
        await prisma.timeBlock.create({ data: { salonId, ...data } })
        revalidatePath("/admin/timeline")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao criar bloqueio" }
    }
}

export async function deleteTimeBlock(id: string) {
    try {
        await prisma.timeBlock.delete({ where: { id } })
        revalidatePath("/admin/timeline")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao remover bloqueio" }
    }
}
