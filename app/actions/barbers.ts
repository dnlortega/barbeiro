"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function createBarber(data: {
    name: string
    email: string
    startTime: string
    endTime: string
}) {
    try {
        const hashedPassword = await bcrypt.hash("barbeiro123", 10)
        const barber = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                role: "BARBER"
            }
        })
        revalidatePath("/admin/barbers")
        revalidatePath("/book")
        return { success: true, data: barber }
    } catch (error) {
        return { success: false, error: "Erro ao criar profissional" }
    }
}

export async function updateBarber(id: string, data: {
    name: string
    email: string
    startTime: string
    endTime: string
    serviceIds: string[]
}) {
    try {
        await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                startTime: data.startTime,
                endTime: data.endTime,
                services: {
                    set: data.serviceIds.map(id => ({ id }))
                }
            }
        })
        revalidatePath("/admin/barbers")
        revalidatePath("/book")
        return { success: true }
    } catch (error) {
        console.error("Error updating barber:", error)
        return { success: false, error: "Erro ao atualizar profissional" }
    }
}

export async function deleteBarber(id: string) {
    try {
        await prisma.user.delete({
            where: { id }
        })
        revalidatePath("/admin/barbers")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao remover profissional. Verifique se ele possui agendamentos vinculados." }
    }
}

export async function getBarberWithServices(id: string) {
    try {
        const barber = await prisma.user.findUnique({
            where: { id },
            include: {
                services: true
            }
        })
        return barber
    } catch (error) {
        return null
    }
}
