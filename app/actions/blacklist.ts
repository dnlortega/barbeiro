"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

async function getSalonId() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Não autenticado")
    return session.user.id
}

export async function getBlacklist() {
    noStore()
    const salonId = await getSalonId()
    return prisma.blacklistedPhone.findMany({
        where: { salonId },
        orderBy: { createdAt: "desc" },
    })
}

export async function addToBlacklist(phone: string, reason?: string) {
    try {
        const salonId = await getSalonId()
        await prisma.blacklistedPhone.create({ data: { salonId, phone, reason } })
        revalidatePath("/admin/blacklist")
        return { success: true }
    } catch {
        return { success: false, error: "Telefone já está na lista ou erro interno" }
    }
}

export async function removeFromBlacklist(id: string) {
    try {
        await prisma.blacklistedPhone.delete({ where: { id } })
        revalidatePath("/admin/blacklist")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao remover" }
    }
}

export async function checkBlacklist(phone: string, salonId: string) {
    noStore()
    return prisma.blacklistedPhone.findUnique({
        where: { salonId_phone: { salonId, phone } },
    })
}
