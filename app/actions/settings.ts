"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"

export async function getSettings(salonId?: string) {
    noStore()
    try {
        const id = salonId ?? (await auth())?.user?.id
        if (!id) return null
        return await prisma.salon.findUnique({ where: { id } })
    } catch {
        return null
    }
}

export async function getPublicSalon(slug?: string) {
    try {
        if (slug) return await prisma.salon.findUnique({ where: { slug } })
        // fallback: primeiro salão (single-tenant)
        return await prisma.salon.findFirst()
    } catch {
        return null
    }
}

export async function updateSettings(data: {
    barberShopName?: string
    name?: string
    whatsapp: string
    address: string
    darkMode: boolean
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { success: false, error: "Não autenticado" }
        await prisma.salon.update({
            where: { id: session.user.id },
            data: {
                name: data.name || data.barberShopName || undefined,
                whatsapp: data.whatsapp,
                address: data.address,
                darkMode: data.darkMode,
            },
        })
        revalidatePath("/admin/settings")
        revalidatePath("/")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao salvar configurações" }
    }
}
