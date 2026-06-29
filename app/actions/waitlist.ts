"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"

async function getSalonId() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Não autenticado")
    return session.user.id
}

export async function addToWaitList(data: {
    customerName: string
    customerPhone: string
    serviceId: string
    barberId?: string
    preferredDate?: Date
    notes?: string
    salonId: string
}) {
    try {
        const entry = await prisma.waitList.create({ data: { ...data, status: "WAITING" } })
        revalidatePath("/admin/waitlist")
        return { success: true, data: entry }
    } catch {
        return { success: false, error: "Erro ao entrar na fila." }
    }
}

export async function getWaitList(salonId?: string) {
    noStore()
    const id = salonId ?? (await getSalonId())
    return prisma.waitList.findMany({
        where: { salonId: id, status: "WAITING" },
        include: { service: true, barber: true },
        orderBy: { createdAt: "asc" },
    })
}

export async function getAllWaitList(salonId?: string) {
    noStore()
    const id = salonId ?? (await getSalonId())
    return prisma.waitList.findMany({
        where: { salonId: id },
        include: { service: true, barber: true },
        orderBy: { createdAt: "asc" },
    })
}

export async function updateWaitListStatus(id: string, status: string) {
    try {
        await prisma.waitList.update({ where: { id }, data: { status } })
        revalidatePath("/admin/waitlist")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao atualizar status." }
    }
}

export async function deleteWaitListEntry(id: string) {
    try {
        await prisma.waitList.delete({ where: { id } })
        revalidatePath("/admin/waitlist")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao remover da fila." }
    }
}

export async function getWaitListCount(salonId?: string) {
    try {
        const id = salonId ?? (await getSalonId())
        return prisma.waitList.count({ where: { salonId: id, status: "WAITING" } })
    } catch {
        return 0
    }
}
