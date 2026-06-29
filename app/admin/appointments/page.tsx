export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AppointmentsTable } from "@/components/admin/appointments-table"

export default async function AdminAppointmentsPage() {
    const session = await auth()
    const isAdmin = session?.user?.isAdmin ?? false
    const salonId = session?.user?.id ?? ""

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
                    {isAdmin ? "Todos os agendamentos de todos os salões." : "Lista completa de clientes e horários reservados."}
                </p>
            </div>
            <AppointmentsTable appointments={appointments} barbers={barbers} showSalon={isAdmin} />
        </div>
    )
}
