"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSettings() {
    try {
        let settings = await prisma.systemSettings.findFirst()

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    id: "default",
                    barberShopName: "Barbearia Premium",
                    whatsapp: "(11) 99999-9999",
                    address: "Rua da Elegância, 123 - Centro",
                    darkMode: true
                }
            })
        }

        return settings
    } catch (error) {
        console.error("Error fetching settings:", error)
        return null
    }
}

export async function updateSettings(data: {
    barberShopName: string
    whatsapp: string
    address: string
    darkMode: boolean
}) {
    try {
        await prisma.systemSettings.update({
            where: { id: "default" },
            data
        })
        revalidatePath("/admin/settings")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error updating settings:", error)
        return { success: false, error: "Erro ao atualizar configurações" }
    }
}
