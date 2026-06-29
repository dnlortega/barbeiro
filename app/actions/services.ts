"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"

async function getSalonId() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Não autenticado")
    return session.user.id
}

export async function createService(data: {
    name: string
    price: number
    duration: number
    isCombo?: boolean
    description?: string
}) {
    try {
        const salonId = await getSalonId()
        const service = await prisma.service.create({ data: { ...data, salonId } })
        revalidatePath("/admin/services")
        revalidatePath("/book")
        return { success: true, data: service }
    } catch {
        return { success: false, error: "Erro ao criar serviço" }
    }
}

export async function updateService(id: string, data: {
    name: string
    price: number
    duration: number
    isCombo?: boolean
    description?: string
}) {
    try {
        const salonId = await getSalonId()
        await prisma.service.update({ where: { id, salonId }, data })
        revalidatePath("/admin/services")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao atualizar serviço" }
    }
}

export async function deleteService(id: string) {
    try {
        const salonId = await getSalonId()
        await prisma.service.delete({ where: { id, salonId } })
        revalidatePath("/admin/services")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao excluir serviço. Verifique se existem agendamentos vinculados." }
    }
}

export async function getServices(salonId?: string) {
    noStore()
    const id = salonId ?? (await getSalonId())
    return prisma.service.findMany({ where: { salonId: id }, orderBy: { name: "asc" } })
}
