export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { format, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TimelineView } from "@/components/admin/timeline-view"

export default async function TimelinePage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""
    const isAdmin = session?.user?.isAdmin ?? false

    const today = new Date()
    const start = startOfDay(today)
    const end = endOfDay(today)

    const [barbers, appointments, timeBlocks] = await Promise.all([
        prisma.barber.findMany({
            where: isAdmin ? undefined : { salonId },
            include: { salon: { select: { name: true } } },
            orderBy: { name: "asc" },
        }),
        prisma.appointment.findMany({
            where: {
                ...(isAdmin ? {} : { salonId }),
                date: { gte: start, lte: end },
                status: { not: "CANCELLED" },
            },
            include: {
                service: { select: { name: true, duration: true, price: true } },
                barber: { select: { id: true, name: true } },
            },
            orderBy: { date: "asc" },
        }),
        prisma.timeBlock.findMany({
            where: {
                ...(isAdmin ? {} : { salonId }),
                date: { gte: start, lte: end },
            },
            include: { barber: { select: { id: true, name: true } } },
        }),
    ])

    return (
        <div className="p-4 md:p-6 space-y-4 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Timeline do Dia</h1>
                    <p className="text-muted-foreground text-sm capitalize">
                        {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
            </div>
            <TimelineView
                barbers={barbers}
                appointments={appointments}
                timeBlocks={timeBlocks}
                salonId={salonId}
                isAdmin={isAdmin}
            />
        </div>
    )
}
