export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AppointmentsTable } from "@/components/admin/appointments-table"

export default async function AdminAppointmentsPage() {
    const session = await auth()
    const isAdmin = session?.user?.isAdmin ?? false
    const salonId = session?.user?.id ?? ""

    const salonInfo = !isAdmin ? await prisma.salon.findUnique({ where: { id: salonId }, select: { name: true } }) : null

    const [appointments, barbers] = await Promise.all([
        prisma.appointment.findMany({
            where: isAdmin ? undefined : { salonId },
            include: { service: true, barber: true, salon: { select: { name: true } } },
            orderBy: { date: "desc" },
        }),
        prisma.barber.findMany({
            where: isAdmin ? undefined : { salonId },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
    ])

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
                <p className="text-muted-foreground text-sm">
                    {isAdmin ? `${appointments.length} agendamentos em todos os salões.` : `${appointments.length} agendamento${appointments.length !== 1 ? "s" : ""} registrado${appointments.length !== 1 ? "s" : ""}.`}
                </p>
            </div>
            <AppointmentsTable appointments={appointments} barbers={barbers} showSalon={isAdmin} salonName={salonInfo?.name} />
        </div>
    )
}
