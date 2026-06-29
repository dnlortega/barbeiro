"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import bcrypt from "bcryptjs"

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
    name: string
    whatsapp: string
    address: string
    darkMode: boolean
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { success: false, error: "Não autenticado" }
        await prisma.salon.update({
            where: { id: session.user.id },
            data: { name: data.name, whatsapp: data.whatsapp, address: data.address, darkMode: data.darkMode },
        })
        revalidatePath("/admin/settings")
        revalidatePath("/")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao salvar configurações" }
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) return { success: false, error: "Não autenticado" }
        const salon = await prisma.salon.findUnique({ where: { id: session.user.id }, select: { password: true } })
        if (!salon) return { success: false, error: "Salão não encontrado" }
        const valid = await bcrypt.compare(currentPassword, salon.password)
        if (!valid) return { success: false, error: "Senha atual incorreta" }
        const hashed = await bcrypt.hash(newPassword, 10)
        await prisma.salon.update({ where: { id: session.user.id }, data: { password: hashed } })
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao alterar senha" }
    }
}
