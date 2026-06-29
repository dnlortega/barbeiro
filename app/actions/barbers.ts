"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"

async function getContext() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Não autenticado")
    return {
        salonId: session.user.id,
        isAdmin: session.user.isAdmin ?? false,
    }
}

export async function createBarber(data: {
    name: string
    email?: string
    startTime: string
    endTime: string
    image?: string
    serviceIds?: string[]
    salonId?: string
}) {
    try {
        const ctx = await getContext()
        const targetSalonId = ctx.isAdmin ? (data.salonId ?? ctx.salonId) : ctx.salonId
        const { serviceIds, salonId: _s, ...rest } = data
        const barber = await prisma.barber.create({
            data: {
                ...rest,
                salonId: targetSalonId,
                ...(serviceIds?.length ? { services: { connect: serviceIds.map(id => ({ id })) } } : {}),
            },
        })
        revalidatePath("/admin/barbers")
        revalidatePath("/book")
        return { success: true, data: barber }
    } catch {
        return { success: false, error: "Erro ao criar profissional" }
    }
}

export async function updateBarber(id: string, data: {
    name: string
    email?: string
    image?: string
    startTime: string
    endTime: string
    serviceIds: string[]
}) {
    try {
        const ctx = await getContext()
        const where = ctx.isAdmin ? { id } : { id, salonId: ctx.salonId }
        await prisma.barber.update({
            where,
            data: {
                name: data.name,
                email: data.email || null,
                image: data.image || null,
                startTime: data.startTime,
                endTime: data.endTime,
                services: { set: data.serviceIds.map(id => ({ id })) },
            },
        })
        revalidatePath("/admin/barbers")
        revalidatePath("/book")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao atualizar profissional" }
    }
}

export async function deleteBarber(id: string) {
    try {
        const ctx = await getContext()
        const where = ctx.isAdmin ? { id } : { id, salonId: ctx.salonId }
        await prisma.barber.delete({ where })
        revalidatePath("/admin/barbers")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao remover profissional. Verifique se há agendamentos vinculados." }
    }
}

export async function getBarbers(salonId?: string) {
    noStore()
    const ctx = await getContext()
    const id = salonId ?? (ctx.isAdmin ? undefined : ctx.salonId)
    return prisma.barber.findMany({
        where: id ? { salonId: id } : undefined,
        include: { services: true, salon: { select: { id: true, name: true } } },
        orderBy: { name: "asc" },
    })
}
