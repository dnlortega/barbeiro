"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"

async function getSalonId() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Não autenticado")
    return session.user.id
}

// ── Package templates ──────────────────────────────────────────────────────

export async function getPackages() {
    noStore()
    const salonId = await getSalonId()
    return prisma.package.findMany({
        where: { salonId },
        include: {
            items: { include: { service: true } },
            _count: { select: { purchases: true } },
        },
        orderBy: { createdAt: "desc" },
    })
}

export async function createPackage(data: {
    name: string
    price: number
    description?: string
    items: { serviceId: string; quantity: number }[]
}) {
    try {
        const salonId = await getSalonId()
        await prisma.package.create({
            data: {
                salonId,
                name: data.name,
                price: data.price,
                description: data.description,
                items: { create: data.items },
            },
        })
        revalidatePath("/admin/packages")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao criar pacote" }
    }
}

export async function deletePackage(id: string) {
    try {
        const salonId = await getSalonId()
        await prisma.package.delete({ where: { id, salonId } })
        revalidatePath("/admin/packages")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao excluir pacote. Verifique se há clientes vinculados." }
    }
}

export async function togglePackageActive(id: string, isActive: boolean) {
    try {
        const salonId = await getSalonId()
        await prisma.package.update({ where: { id, salonId }, data: { isActive } })
        revalidatePath("/admin/packages")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao atualizar pacote" }
    }
}

// ── Client packages (sales) ────────────────────────────────────────────────

export async function getClientPackages() {
    noStore()
    const salonId = await getSalonId()
    return prisma.clientPackage.findMany({
        where: { salonId },
        include: {
            package: {
                include: { items: { include: { service: true } } },
            },
            usages: { include: { service: true }, orderBy: { usedAt: "desc" } },
        },
        orderBy: { purchasedAt: "desc" },
    })
}

export async function sellPackage(data: {
    packageId: string
    customerName: string
    customerPhone: string
    expiresAt?: Date
}) {
    try {
        const salonId = await getSalonId()
        await prisma.clientPackage.create({
            data: { salonId, ...data },
        })
        revalidatePath("/admin/packages")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao registrar venda do pacote" }
    }
}

export async function usePackageSession(data: {
    clientPackageId: string
    serviceId: string
    notes?: string
}) {
    try {
        await prisma.packageUsage.create({ data })
        revalidatePath("/admin/packages")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao registrar uso de sessão" }
    }
}

export async function deletePackageUsage(id: string) {
    try {
        await prisma.packageUsage.delete({ where: { id } })
        revalidatePath("/admin/packages")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao remover uso" }
    }
}
