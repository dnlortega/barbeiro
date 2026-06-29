"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function rateAppointment(id: string, rating: number, note?: string) {
    try {
        await prisma.appointment.update({
            where: { id },
            data: { rating, ratingNote: note || null },
        })
        revalidatePath("/admin/appointments")
        revalidatePath("/admin")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao salvar avaliação" }
    }
}
