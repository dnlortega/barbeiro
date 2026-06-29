"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"

async function getSalonId() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Não autenticado")
    return session.user.id
}

export async function getClosedDates(salonId?: string) {
    noStore()
    const id = salonId ?? (await getSalonId())
    return prisma.closedDate.findMany({ where: { salonId: id }, orderBy: { date: "asc" } })
}

export async function addClosedDate(date: Date, reason?: string) {
    try {
        const salonId = await getSalonId()
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const existing = await prisma.closedDate.findFirst({ where: { salonId, date: start } })
        if (existing) return { success: false, error: "Esta data já está marcada como fechada.", data: null }
        const created = await prisma.closedDate.create({ data: { date: start, reason: reason || null, salonId } })
        revalidatePath("/admin/settings")
        revalidatePath("/book")
        return { success: true, data: created }
    } catch {
        return { success: false, error: "Erro ao adicionar data.", data: null }
    }
}

export async function removeClosedDate(id: string) {
    try {
        const salonId = await getSalonId()
        await prisma.closedDate.delete({ where: { id, salonId } })
        revalidatePath("/admin/settings")
        revalidatePath("/book")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao remover data." }
    }
}
