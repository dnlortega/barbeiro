export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { startOfMonth, endOfMonth } from "date-fns"
import { CommissionView } from "@/components/admin/commission-view"

export default async function CommissionsPage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""
    const isAdmin = session?.user?.isAdmin ?? false

    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    const barbers = await prisma.barber.findMany({
        where: isAdmin ? undefined : { salonId },
        include: {
            appointments: {
                where: { date: { gte: start, lte: end }, status: "COMPLETED" },
                include: { service: { select: { price: true } } },
            },
        },
        orderBy: { name: "asc" },
    })

    const barberStats = barbers.map(b => {
        const revenue = b.appointments.reduce((s, a) => s + a.service.price, 0)
        return {
            id: b.id,
            name: b.name,
            commission: b.commission,
            monthlyGoal: b.monthlyGoal,
            revenue,
            appointments: b.appointments.length,
            commissionValue: (revenue * b.commission) / 100,
        }
    })

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Comissões</h1>
                <p className="text-muted-foreground text-sm">
                    Comissões e metas do mês atual. Clique nos valores para editar.
                </p>
            </div>
            <CommissionView barberStats={barberStats} />
        </div>
    )
}
