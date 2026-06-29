"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import { headers } from "next/headers"

const rateMap = new Map<string, number[]>()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const windowMs = 60 * 60 * 1000
    const max = 5
    const timestamps = (rateMap.get(ip) || []).filter(t => now - t < windowMs)
    if (timestamps.length >= max) return false
    timestamps.push(now)
    rateMap.set(ip, timestamps)
    return true
}

function generateTimeSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
    const slots: string[] = []
    const [sh, sm] = startTime.split(":").map(Number)
    const [eh, em] = endTime.split(":").map(Number)
    let cur = sh * 60 + sm
    const end = eh * 60 + em
    const interval = Math.max(30, durationMinutes)
    while (cur + durationMinutes <= end) {
        const h = Math.floor(cur / 60)
        const m = cur % 60
        slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
        cur += interval
    }
    return slots
}

async function getSalonId() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Não autenticado")
    return session.user.id
}

export async function getBarberSlots(date: Date, barberId: string, serviceDuration: number) {
    noStore()
    const barber = await prisma.barber.findUnique({
        where: { id: barberId },
        select: { startTime: true, endTime: true },
    })
    const startTime = barber?.startTime || "09:00"
    const endTime = barber?.endTime || "18:00"
    return generateTimeSlots(startTime, endTime, serviceDuration)
}

export async function createAppointment(data: {
    date: Date
    serviceId: string
    barberId: string
    customerName?: string
    customerPhone?: string
    salonId: string
}) {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    if (!checkRateLimit(ip)) {
        return { success: false, error: "Muitos agendamentos em pouco tempo. Aguarde e tente novamente." }
    }

    if (data.date < new Date()) {
        return { success: false, error: "Não é possível agendar para uma data no passado." }
    }

    const barber = await prisma.barber.findFirst({
        where: {
            id: data.barberId,
            salonId: data.salonId,
            services: { some: { id: data.serviceId } },
        },
        select: { startTime: true, endTime: true },
    })

    if (!barber) {
        return { success: false, error: "Este barbeiro não realiza o serviço selecionado." }
    }

    const appointmentMinutes = data.date.getHours() * 60 + data.date.getMinutes()
    const [sh, sm] = (barber.startTime || "09:00").split(":").map(Number)
    const [eh, em] = (barber.endTime || "18:00").split(":").map(Number)
    if (appointmentMinutes < sh * 60 + sm || appointmentMinutes >= eh * 60 + em) {
        return { success: false, error: "Horário fora do expediente deste barbeiro." }
    }

    const existing = await prisma.appointment.findFirst({
        where: {
            barberId: data.barberId,
            date: data.date,
            status: { not: "CANCELLED" },
        },
    })
    if (existing) {
        return { success: false, error: "Este horário já foi reservado. Por favor, escolha outro." }
    }

    try {
        const appointment = await prisma.appointment.create({
            data: {
                date: data.date,
                serviceId: data.serviceId,
                barberId: data.barberId,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                salonId: data.salonId,
                status: "PENDING",
            },
        })
        revalidatePath("/admin")
        revalidatePath("/admin/appointments")
        revalidatePath("/book")
        return { success: true, data: appointment }
    } catch {
        return { success: false, error: "Falha ao criar agendamento no servidor." }
    }
}

export async function getServices(salonId?: string) {
    noStore()
    if (salonId) return prisma.service.findMany({ where: { salonId }, orderBy: { name: "asc" } })
    const id = await getSalonId()
    return prisma.service.findMany({ where: { salonId: id }, orderBy: { name: "asc" } })
}

export async function getBarbers(serviceId?: string, salonId?: string) {
    noStore()
    const id = salonId ?? await getSalonId()
    const barbers = await prisma.barber.findMany({
        where: {
            salonId: id,
            ...(serviceId ? { services: { some: { id: serviceId } } } : {}),
        },
    })
    if (barbers.length === 0 && serviceId) {
        return prisma.barber.findMany({ where: { salonId: id } })
    }
    return barbers
}

export async function getOccupiedSlots(date: Date, barberId: string) {
    noStore()
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const occupied = await prisma.appointment.findMany({
        where: {
            barberId,
            date: { gte: startOfDay, lte: endOfDay },
            status: { not: "CANCELLED" },
        },
        select: { date: true },
    })

    return occupied.map(app => {
        const d = new Date(app.date)
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    })
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        await prisma.appointment.update({ where: { id }, data: { status } })
        revalidatePath("/admin")
        revalidatePath("/admin/appointments")
        return { success: true }
    } catch {
        return { success: false, error: "Falha ao atualizar status." }
    }
}

export async function deleteAppointment(id: string) {
    try {
        await prisma.appointment.delete({ where: { id } })
        revalidatePath("/admin")
        revalidatePath("/admin/appointments")
        return { success: true }
    } catch {
        return { success: false, error: "Falha ao excluir o agendamento." }
    }
}

export async function getAdminAppointments(filters?: {
    // noStore called inside
    status?: string
    barberId?: string
    date?: Date
}) {
    const salonId = await getSalonId()

    const where: Record<string, unknown> = { salonId }
    if (filters?.status && filters.status !== "all") where.status = filters.status
    if (filters?.barberId && filters.barberId !== "all") where.barberId = filters.barberId
    if (filters?.date) {
        const start = new Date(filters.date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(filters.date)
        end.setHours(23, 59, 59, 999)
        where.date = { gte: start, lte: end }
    }

    return prisma.appointment.findMany({
        where,
        include: { service: true, barber: true },
        orderBy: { date: "desc" },
    })
}

export async function getWeeklyStats() {
    const salonId = await getSalonId()
    const days: { date: Date; label: string }[] = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
        days.push({ date: d, label: labels[d.getDay()] })
    }

    const results = await Promise.all(
        days.map(async ({ date, label }) => {
            const start = new Date(date)
            const end = new Date(date)
            end.setHours(23, 59, 59, 999)
            const count = await prisma.appointment.count({
                where: { salonId, date: { gte: start, lte: end }, status: { not: "CANCELLED" } },
            })
            return { label, count }
        })
    )
    return results
}
