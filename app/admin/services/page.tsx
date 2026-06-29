export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Scissors, Clock, DollarSign, Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ServiceActions } from "@/components/admin/service-actions"
import { CreateServiceDialog } from "@/components/admin/create-service-dialog"

export default async function AdminServicesPage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""
    const isAdmin = session?.user?.isAdmin ?? false

    const services = isAdmin
        ? await prisma.service.findMany({
            include: { salon: { select: { name: true } } },
            orderBy: [{ salon: { name: "asc" } }, { name: "asc" }],
        })
        : await prisma.service.findMany({
            where: { salonId },
            orderBy: { name: "asc" },
        })

    const combos = services.filter(s => s.isCombo)
    const regular = services.filter(s => !s.isCombo)

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
                    <p className="text-muted-foreground text-sm">
                        {isAdmin ? `${services.length} serviços em todos os salões` : "Gerencie os serviços e preços oferecidos."}
                    </p>
                </div>
                {!isAdmin && <CreateServiceDialog existingServices={regular} />}
            </div>

            {services.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Scissors className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Nenhum serviço cadastrado.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {combos.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="font-semibold text-sm flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary" /> Combos
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {combos.map(service => (
                                    <ServiceCard key={service.id} service={service} isAdmin={isAdmin} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {combos.length > 0 && (
                            <h2 className="font-semibold text-sm flex items-center gap-2">
                                <Scissors className="w-4 h-4 text-primary" /> Serviços individuais
                            </h2>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {regular.map(service => (
                                <ServiceCard key={service.id} service={service} isAdmin={isAdmin} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

type ServiceWithSalon = {
    id: string
    name: string
    price: number
    duration: number
    isCombo: boolean
    description: string | null
    salon?: { name: string }
}

function ServiceCard({ service, isAdmin }: { service: ServiceWithSalon; isAdmin: boolean }) {
    return (
        <Card>
            <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {service.isCombo ? <Package className="w-5 h-5 text-primary" /> : <Scissors className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="flex items-center gap-1">
                        {service.isCombo && <Badge className="bg-violet-100 text-violet-700 text-[10px]">Combo</Badge>}
                        {!isAdmin && <ServiceActions serviceId={service.id} service={service} />}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-base">{service.name}</h3>
                    {service.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                    )}
                    {isAdmin && service.salon && (
                        <Badge variant="outline" className="text-[10px] mt-1">{service.salon.name}</Badge>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">{service.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary font-semibold">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span className="text-sm">R$ {service.price.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
