"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createAppointment(data: {
    date: Date
    serviceId: string
    barberId: string
    customerName?: string
    customerPhone?: string
}) {
    try {
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                barberId: data.barberId,
                date: data.date,
                status: {
                    not: "CANCELLED"
                }
            }
        })

        if (existingAppointment) {
            return {
                success: false,
                error: "Este horário já foi reservado para este profissional. Por favor, escolha outro horário."
            }
        }

        const appointment = await prisma.appointment.create({
            data: {
                date: data.date,
                serviceId: data.serviceId,
                barberId: data.barberId,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                status: "PENDING",
            },
        })

        revalidatePath("/admin")
        revalidatePath("/admin/appointments")
        revalidatePath("/book")
        revalidatePath("/pro")

        return { success: true, data: appointment }
    } catch (error) {
        console.error("Error creating appointment:", error)
        return { success: false, error: "Falha ao criar agendamento no servidor." }
    }
}

export async function getServices() {
    return await prisma.service.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function getBarbers(serviceId?: string) {
    // Tenta buscar barbeiros vinculados ao serviço
    const specificBarbers = await prisma.user.findMany({
        where: {
            role: "BARBER",
            ...(serviceId ? {
                services: {
                    some: { id: serviceId }
                }
            } : {})
        }
    })

    // Se não encontrou nenhum barbeiro específico (ou não passou ID), 
    // retorna todos os usuários com o papel de BARBER
    if (specificBarbers.length === 0) {
        return await prisma.user.findMany({
            where: {
                role: "BARBER"
            }
        })
    }

    return specificBarbers
}

export async function getOccupiedSlots(date: Date, barberId: string) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const occupied = await prisma.appointment.findMany({
        where: {
            barberId: barberId,
            date: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: {
                not: "CANCELLED"
            }
        },
        select: {
            date: true
        }
    })

    return occupied.map(app => {
        const d = new Date(app.date)
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    })
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        await prisma.appointment.update({
            where: { id },
            data: { status }
        })
        revalidatePath("/admin")
        revalidatePath("/admin/appointments")
        revalidatePath("/pro")
        return { success: true }
    } catch (error) {
        console.error("Error updating appointment:", error)
        return { success: false, error: "Failed to update status" }
    }
}

export async function deleteAppointment(id: string) {
    try {
        await prisma.appointment.delete({
            where: { id }
        })
        revalidatePath("/admin")
        revalidatePath("/admin/appointments")
        revalidatePath("/pro")
        return { success: true }
    } catch (error) {
        console.error("Error deleting appointment:", error)
        return { success: false, error: "Falha ao excluir o agendamento." }
    }
}

export async function getBarberAppointments(barberId: string, date?: Date) {
    if (date) {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        return await prisma.appointment.findMany({
            where: {
                barberId: barberId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                service: true
            },
            orderBy: {
                date: 'asc'
            }
        })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return await prisma.appointment.findMany({
        where: {
            barberId: barberId,
            date: {
                gte: today
            }
        },
        include: {
            service: true
        },
        orderBy: {
            date: 'asc'
        }
    })
}
