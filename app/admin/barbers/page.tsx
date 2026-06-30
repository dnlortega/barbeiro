export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Mail, Clock, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarberActions } from "@/components/admin/barber-actions"
import { CreateBarberDialog } from "@/components/admin/create-barber-dialog"

export default async function AdminBarbersPage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""
    const isAdmin = session?.user?.isAdmin ?? false

    const [barbers, allServices, salons] = await Promise.all([
        isAdmin
            ? prisma.barber.findMany({
                include: { services: true, salon: { select: { name: true } } },
                orderBy: [{ salon: { name: "asc" } }, { name: "asc" }],
            })
            : prisma.barber.findMany({
                where: { salonId },
                include: { services: true },
                orderBy: { name: "asc" },
            }),
        isAdmin
            ? prisma.service.findMany({ orderBy: { name: "asc" } })
            : prisma.service.findMany({ where: { salonId }, orderBy: { name: "asc" } }),
        isAdmin
            ? prisma.salon.findMany({ where: { isAdmin: false }, select: { id: true, name: true }, orderBy: { name: "asc" } })
            : Promise.resolve([]),
    ])

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Profissionais</h1>
                    <p className="text-muted-foreground text-sm">
                        {isAdmin
                            ? `${barbers.length} profissional${barbers.length !== 1 ? "is" : ""} em ${salons.length} salões`
                            : "Gerencie a equipe de barbeiros e seus horários."}
                    </p>
                </div>
                {!isAdmin && <CreateBarberDialog allServices={allServices} />}
            </div>

            {isAdmin && salons.length > 0 ? (
                <div className="space-y-8">
                    {salons.map(salon => {
                        const salonBarbers = (barbers as (typeof barbers[0] & { salon?: { name: string } })[])
                            .filter(b => (b as { salonId?: string }).salonId === salon.id || b.salon?.name === salon.name)
                        return (
                            <div key={salon.id} className="space-y-3">
                                <h2 className="font-semibold text-base border-b pb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    {salon.name}
                                    <Badge variant="secondary" className="text-[10px]">{salonBarbers.length} profissional{salonBarbers.length !== 1 ? "is" : ""}</Badge>
                                </h2>
                                {salonBarbers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-2">Nenhum profissional neste salão.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {salonBarbers.map(barber => (
                                            <BarberCard key={barber.id} barber={barber} allServices={allServices} isAdmin={isAdmin} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : barbers.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Nenhum profissional cadastrado.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {barbers.map(barber => (
                        <BarberCard key={barber.id} barber={barber} allServices={allServices} isAdmin={isAdmin} />
                    ))}
                </div>
            )}
        </div>
    )
}

type BarberType = {
    id: string
    name: string | null
    email: string | null
    image: string | null
    startTime: string | null
    endTime: string | null
    commission: number
    monthlyGoal: number | null
    isActive: boolean
    bio: string | null
    services: { id: string; name: string }[]
    salon?: { name: string }
    salonId?: string
}

function BarberCard({ barber, allServices, isAdmin }: { barber: BarberType; allServices: { id: string; name: string }[]; isAdmin: boolean }) {
    return (
        <Card className={`overflow-hidden py-0 gap-0 ${!barber.isActive ? "opacity-60" : ""}`}>
            <div className="aspect-3/2 bg-muted relative">
                {barber.image ? (
                    <img src={barber.image} alt={barber.name ?? ""} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-muted-foreground/20">
                        {barber.name?.charAt(0)?.toUpperCase()}
                    </div>
                )}
                {!barber.isActive && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <Badge variant="secondary" className="text-xs">Inativo</Badge>
                    </div>
                )}
                {!isAdmin && (
                    <div className="absolute top-3 right-3">
                        <BarberActions barber={barber} allServices={allServices} />
                    </div>
                )}
            </div>
            <CardContent className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-base">{barber.name}</h3>
                    {barber.bio && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{barber.bio}</p>}
                    {barber.email && (
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                            <Mail className="w-3 h-3" />
                            <p className="text-xs">{barber.email}</p>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">{barber.startTime || "--:--"} – {barber.endTime || "--:--"}</span>
                    {barber.commission > 0 && (
                        <Badge variant="outline" className="ml-auto text-[10px]">{barber.commission}% comissão</Badge>
                    )}
                </div>
                <div className="flex flex-wrap gap-1">
                    {barber.services.length === 0 ? (
                        <Badge variant="secondary" className="text-[11px]">Sem serviços</Badge>
                    ) : barber.services.map(s => (
                        <Badge key={s.id} variant="outline" className="text-[11px]">{s.name}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
