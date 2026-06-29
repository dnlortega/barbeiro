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

export async function getStockItems() {
    noStore()
    const salonId = await getSalonId()
    return prisma.stockItem.findMany({
        where: { salonId },
        include: { transactions: { orderBy: { createdAt: "desc" }, take: 10 } },
        orderBy: { name: "asc" },
    })
}

export async function createStockItem(data: {
    name: string
    unit: string
    quantity: number
    minQuantity: number
    costPrice?: number
}) {
    try {
        const salonId = await getSalonId()
        await prisma.stockItem.create({ data: { salonId, ...data } })
        revalidatePath("/admin/stock")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao criar item" }
    }
}

export async function updateStockItem(id: string, data: {
    name?: string
    unit?: string
    minQuantity?: number
    costPrice?: number
}) {
    try {
        await prisma.stockItem.update({ where: { id }, data })
        revalidatePath("/admin/stock")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao atualizar" }
    }
}

export async function deleteStockItem(id: string) {
    try {
        await prisma.stockItem.delete({ where: { id } })
        revalidatePath("/admin/stock")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao remover" }
    }
}

export async function addStockTransaction(stockItemId: string, type: "IN" | "OUT" | "ADJUST", quantity: number, notes?: string) {
    try {
        const item = await prisma.stockItem.findUnique({ where: { id: stockItemId } })
        if (!item) return { success: false, error: "Item não encontrado" }
        const delta = type === "IN" ? quantity : type === "OUT" ? -quantity : quantity - item.quantity
        const newQty = type === "ADJUST" ? quantity : item.quantity + delta
        if (newQty < 0) return { success: false, error: "Estoque insuficiente" }
        await prisma.$transaction([
            prisma.stockTransaction.create({
                data: { stockItemId, type, quantity: type === "ADJUST" ? quantity - item.quantity : delta, notes },
            }),
            prisma.stockItem.update({ where: { id: stockItemId }, data: { quantity: newQty } }),
        ])
        revalidatePath("/admin/stock")
        return { success: true }
    } catch {
        return { success: false, error: "Erro na movimentação" }
    }
}
