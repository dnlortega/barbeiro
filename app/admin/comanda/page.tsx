export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { format, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ComandaView } from "@/components/admin/comanda-view"

export default async function ComandaPage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""
    const isAdmin = session?.user?.isAdmin ?? false

    const today = new Date()
    const start = startOfDay(today)
    const end = endOfDay(today)

    const [appointments, salonInfo] = await Promise.all([
        prisma.appointment.findMany({
            where: {
                ...(isAdmin ? {} : { salonId }),
                date: { gte: start, lte: end },
                status: { not: "CANCELLED" },
            },
            include: {
                service: { select: { name: true, price: true, duration: true } },
                barber: { select: { name: true } },
                salon: { select: { name: true } },
            },
            orderBy: { date: "asc" },
        }),
        !isAdmin ? prisma.salon.findUnique({ where: { id: salonId }, select: { name: true, address: true } }) : null,
    ])

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Comanda do Dia</h1>
                    <p className="text-muted-foreground text-sm capitalize">
                        {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
            </div>
            <ComandaView
                appointments={appointments}
                salonName={salonInfo?.name ?? "Todos os Salões"}
                salonAddress={salonInfo?.address ?? ""}
                date={today}
                isAdmin={isAdmin}
            />
        </div>
    )
}
