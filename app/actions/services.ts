"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createService(data: {
    name: string
    price: number
    duration: number
}) {
    try {
        const service = await prisma.service.create({
            data
        })
        revalidatePath("/admin/services")
        revalidatePath("/book")
        return { success: true, data: service }
    } catch (error) {
        return { success: false, error: "Erro ao criar serviço" }
    }
}

export async function updateService(id: string, data: {
    name: string
    price: number
    duration: number
}) {
    try {
        await prisma.service.update({
            where: { id },
            data
        })
        revalidatePath("/admin/services")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao atualizar serviço" }
    }
}

export async function deleteService(id: string) {
    try {
        await prisma.service.delete({
            where: { id }
        })
        revalidatePath("/admin/services")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao excluir serviço. Verifique se existem agendamentos vinculados." }
    }
}
