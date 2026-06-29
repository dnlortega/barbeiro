export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ReportExport } from "@/components/admin/report-export"

export default async function ReportPage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""
    const isAdmin = session?.user?.isAdmin ?? false

    const appointments = await prisma.appointment.findMany({
        where: isAdmin ? undefined : { salonId },
        include: {
            service: { select: { name: true, price: true } },
            barber: { select: { name: true } },
            salon: { select: { name: true } },
        },
        orderBy: { date: "desc" },
    })

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
                <p className="text-muted-foreground text-sm">Exporte e analise os dados de agendamentos.</p>
            </div>
            <ReportExport appointments={appointments} isAdmin={isAdmin} />
        </div>
    )
}
