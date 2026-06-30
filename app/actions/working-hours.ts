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

// Pública: usada no booking wizard (sem auth)
export async function getPublicWorkingHours(salonId: string) {
    noStore()
    const saved = await prisma.workingHours.findMany({
        where: { salonId },
        orderBy: { dayOfWeek: "asc" },
    })
    return Array.from({ length: 7 }, (_, i) => {
        const found = saved.find(d => d.dayOfWeek === i)
        return found ?? { dayOfWeek: i, isOpen: i > 0 && i < 7, openTime: "09:00", closeTime: "19:00" }
    })
}

export async function getWorkingHours() {
    noStore()
    const salonId = await getSalonId()
    const saved = await prisma.workingHours.findMany({
        where: { salonId },
        orderBy: { dayOfWeek: "asc" },
    })
    // Preenche os 7 dias com defaults se não existirem
    const days = Array.from({ length: 7 }, (_, i) => {
        const found = saved.find(d => d.dayOfWeek === i)
        return found ?? {
            id: "",
            salonId,
            dayOfWeek: i,
            isOpen: i > 0 && i < 7,
            openTime: "09:00",
            closeTime: "19:00",
        }
    })
    return days
}

export async function saveWorkingHours(hours: {
    dayOfWeek: number
    isOpen: boolean
    openTime: string
    closeTime: string
}[]) {
    try {
        const salonId = await getSalonId()
        await Promise.all(
            hours.map(h =>
                prisma.workingHours.upsert({
                    where: { salonId_dayOfWeek: { salonId, dayOfWeek: h.dayOfWeek } },
                    update: { isOpen: h.isOpen, openTime: h.openTime, closeTime: h.closeTime },
                    create: { salonId, ...h },
                })
            )
        )
        revalidatePath("/admin/settings")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao salvar horários" }
    }
}
