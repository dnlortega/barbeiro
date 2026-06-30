import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Scissors, Clock, DollarSign, CalendarDays, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { AppointmentActions } from "@/components/admin/appointment-actions"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Dashboard — Admin",
}

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
    PENDING: { label: "Pendente", variant: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: "Confirmado", variant: "bg-emerald-100 text-emerald-700" },
    COMPLETED: { label: "Concluído", variant: "bg-blue-100 text-blue-700" },
    CANCELLED: { label: "Cancelado", variant: "bg-red-100 text-red-600" },
    NO_SHOW: { label: "Não compareceu", variant: "bg-slate-100 text-slate-500" },
}

export default async function AdminPage() {
    const session = await auth()
    const isAdmin = session?.user?.isAdmin ?? false
    const salonId = session?.user?.id ?? ""
    const whereFilter = isAdmin ? undefined : { salonId }

    const salonInfo = !isAdmin ? await prisma.salon.findUnique({ where: { id: salonId }, select: { name: true } }) : null

    const now = new Date()
    const upcomingFilter = isAdmin ? { date: { gte: now } } : { salonId, date: { gte: now } }

    const [allAppointments, services, barbers, upcomingAppointments] = await Promise.all([
        prisma.appointment.findMany({
            where: whereFilter,
            include: { service: true, barber: true, salon: { select: { name: true } } },
            orderBy: { date: "desc" },
            take: 500,
        }),
        prisma.service.findMany({ where: whereFilter, orderBy: { price: "asc" } }),
        prisma.barber.findMany({ where: whereFilter }),
        prisma.appointment.findMany({
            where: upcomingFilter,
            include: { service: true, barber: true, salon: { select: { name: true } } },
            orderBy: { date: "asc" },
            take: 10,
        }),
    ])

    const today = new Date()
    const todayApps = allAppointments.filter(a => {
        const d = new Date(a.date)
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    })

    const estimatedRevenue = allAppointments
        .filter(a => a.status === "CONFIRMED" || a.status === "PENDING")
        .reduce((acc, a) => acc + a.service.price, 0)

    const completedRevenue = allAppointments
        .filter(a => a.status === "COMPLETED")
        .reduce((acc, a) => acc + a.service.price, 0)


    const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    const weeklyData = dayLabels.map((label, idx) => ({
        label,
        count: allAppointments.filter(a => new Date(a.date).getDay() === idx && new Date(a.date) >= weekAgo).length,
    }))
    const maxWeekly = Math.max(...weeklyData.map(d => d.count), 1)

    const revenueByStatus = [
        { label: "Pendente", status: "PENDING", color: "bg-amber-400" },
        { label: "Confirmado", status: "CONFIRMED", color: "bg-emerald-400" },
        { label: "Concluído", status: "COMPLETED", color: "bg-blue-400" },
        { label: "Cancelado", status: "CANCELLED", color: "bg-red-300" },
    ].map(s => ({
        ...s,
        value: allAppointments.filter(a => a.status === s.status).reduce((acc, a) => acc + a.service.price, 0),
        count: allAppointments.filter(a => a.status === s.status).length,
    }))
    const maxRevenue = Math.max(...revenueByStatus.map(s => s.value), 1)

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground text-sm">{format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: "Agendamentos hoje", value: todayApps.length, icon: CalendarDays, sub: `${allAppointments.length} total` },
                    { title: "Serviços", value: services.length, icon: Scissors, sub: `${barbers.length} profissional${barbers.length !== 1 ? "is" : ""}` },
                    { title: "Receita prevista", value: `R$ ${estimatedRevenue.toFixed(0)}`, icon: TrendingUp, sub: "Pendentes + Confirmados" },
                    { title: "Receita realizada", value: `R$ ${completedRevenue.toFixed(0)}`, icon: DollarSign, sub: "Concluídos" },
                ].map(({ title, value, icon: Icon, sub }) => (
                    <Card key={title}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>{title}</CardDescription>
                                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-2xl font-bold tracking-tight">{value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Agendamentos por dia</CardTitle>
                        <CardDescription>Últimos 7 dias</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2 h-28">
                            {weeklyData.map(d => (
                                <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                                    <span className="text-[10px] font-semibold text-muted-foreground">{d.count > 0 ? d.count : ""}</span>
                                    <div className="w-full rounded-t-sm bg-muted relative" style={{ height: "80px" }}>
                                        <div
                                            className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-500"
                                            style={{ height: `${Math.max((d.count / maxWeekly) * 100, d.count > 0 ? 6 : 0)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-medium">{d.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Receita por status</CardTitle>
                        <CardDescription>Valor total em R$</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {revenueByStatus.map(s => (
                            <div key={s.status} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">{s.label}</span>
                                    <span className="font-semibold">R$ {s.value.toFixed(0)} <span className="font-normal text-muted-foreground">({s.count})</span></span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all duration-500", s.color)}
                                        style={{ width: `${Math.max((s.value / maxRevenue) * 100, s.value > 0 ? 3 : 0)}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Recent appointments + services */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-sm">Próximos agendamentos</h2>
                            <p className="text-[11px] text-muted-foreground">A partir de agora</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/appointments" className="text-xs text-primary">Ver todos</Link>
                        </Button>
                    </div>
                    {/* Tabela — desktop */}
                    <Card className="py-0 hidden sm:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Serviço</TableHead>
                                    <TableHead className="text-center">Data</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => {
                                    const st = STATUS_MAP[app.status] || STATUS_MAP.PENDING
                                    return (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <p className="font-medium text-sm">{app.customerName || "Anônimo"}</p>
                                                <p className="text-xs text-muted-foreground">{app.customerPhone || "—"}</p>
                                            </TableCell>
                                            <TableCell className="text-sm">{app.service.name}</TableCell>
                                            <TableCell className="text-center">
                                                <p className="text-sm font-medium">{format(new Date(app.date), "dd/MM")}</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(app.date), "HH:mm")}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("text-[11px]", st.variant)}>{st.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AppointmentActions appointmentId={app.id} phone={app.customerPhone} name={app.customerName} status={app.status} salonName={isAdmin ? (app as typeof app & { salon?: { name: string } }).salon?.name : salonInfo?.name} />
                                            </TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            Nenhum agendamento futuro
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                    {/* Cards — mobile */}
                    <div className="sm:hidden space-y-2">
                        {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => {
                            const st = STATUS_MAP[app.status] || STATUS_MAP.PENDING
                            return (
                                <Card key={app.id} className="p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{app.customerName || "Anônimo"}</p>
                                            <p className="text-xs text-muted-foreground">{app.service.name} · {format(new Date(app.date), "dd/MM HH:mm")}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge className={cn("text-[10px]", st.variant)}>{st.label}</Badge>
                                            <AppointmentActions appointmentId={app.id} phone={app.customerPhone} name={app.customerName} />
                                        </div>
                                    </div>
                                </Card>
                            )
                        }) : (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                <Clock className="w-6 h-6 mx-auto mb-2 opacity-20" />
                                Nenhum agendamento futuro
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="font-semibold text-sm">Serviços</h2>
                    <Card>
                        <CardContent className="space-y-2 pt-2">
                            {services.slice(0, 6).map(s => (
                                <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                                            <Scissors className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{s.name}</p>
                                            <p className="text-[11px] text-muted-foreground">{s.duration} min</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-primary">R$ {s.price.toFixed(0)}</span>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                                <Link href="/admin/services">Gerenciar catálogo</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
