export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ClientHistory } from "@/components/admin/client-history"

export default async function ClientsPage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""
    const isAdmin = session?.user?.isAdmin ?? false

    const appointments = await prisma.appointment.findMany({
        where: {
            ...(isAdmin ? {} : { salonId }),
            customerPhone: { not: null },
        },
        include: {
            service: { select: { name: true, price: true } },
            barber: { select: { name: true } },
            salon: { select: { name: true } },
        },
        orderBy: { date: "desc" },
    })

    // Agrupar por telefone
    const clientMap = new Map<string, typeof appointments>()
    for (const app of appointments) {
        const phone = app.customerPhone!
        if (!clientMap.has(phone)) clientMap.set(phone, [])
        clientMap.get(phone)!.push(app)
    }

    const clients = Array.from(clientMap.entries()).map(([phone, apps]) => ({
        phone,
        name: apps[0].customerName || "Sem nome",
        appointments: apps,
        totalSpent: apps.filter(a => a.status === "COMPLETED").reduce((acc, a) => acc + a.service.price, 0),
        totalVisits: apps.filter(a => a.status === "COMPLETED").length,
        lastVisit: apps[0].date,
        rating: apps.filter(a => a.rating).length > 0
            ? apps.filter(a => a.rating).reduce((acc, a) => acc + (a.rating ?? 0), 0) / apps.filter(a => a.rating).length
            : null,
    })).sort((a, b) => b.totalVisits - a.totalVisits)

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Histórico de Clientes</h1>
                <p className="text-muted-foreground text-sm">
                    {clients.length} cliente{clients.length !== 1 ? "s" : ""} com agendamentos registrados.
                </p>
            </div>
            <ClientHistory clients={clients} />
        </div>
    )
}
