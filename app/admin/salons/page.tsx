export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format, startOfWeek, endOfWeek, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Store, Users, CalendarDays, DollarSign, TrendingUp, Scissors, Award, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default async function AdminSalonsPage() {
    const session = await auth()
    if (!session?.user?.isAdmin) redirect("/admin")

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)

    const salons = await prisma.salon.findMany({
        where: { isAdmin: false },
        include: {
            barbers: { select: { id: true, name: true } },
            services: { select: { id: true, name: true, price: true, isCombo: true } },
            appointments: {
                include: { service: { select: { price: true } } },
            },
        },
        orderBy: { name: "asc" },
    })

    const stats = salons.map(salon => {
        const appts = salon.appointments
        const totalAppts = appts.length
        const todayAppts = appts.filter(a => {
            const d = new Date(a.date)
            return d.toDateString() === now.toDateString()
        }).length
        const weekAppts = appts.filter(a => {
            const d = new Date(a.date)
            return d >= weekStart && d <= weekEnd
        }).length
        const monthAppts = appts.filter(a => new Date(a.date) >= monthStart).length
        const completedAppts = appts.filter(a => a.status === "COMPLETED")
        const revenueCompleted = completedAppts.reduce((acc, a) => acc + a.service.price, 0)
        const pendingRevenue = appts
            .filter(a => a.status === "PENDING" || a.status === "CONFIRMED")
            .reduce((acc, a) => acc + a.service.price, 0)
        const cancelRate = totalAppts > 0
            ? ((appts.filter(a => a.status === "CANCELLED" || a.status === "NO_SHOW").length / totalAppts) * 100)
            : 0

        return {
            id: salon.id,
            name: salon.name,
            email: salon.email,
            barberCount: salon.barbers.length,
            serviceCount: salon.services.length,
            comboCount: salon.services.filter(s => s.isCombo).length,
            totalAppts,
            todayAppts,
            weekAppts,
            monthAppts,
            revenueCompleted,
            pendingRevenue,
            cancelRate,
        }
    })

    const maxAppts = Math.max(...stats.map(s => s.totalAppts), 1)
    const maxRevenue = Math.max(...stats.map(s => s.revenueCompleted), 1)
    const maxWeek = Math.max(...stats.map(s => s.weekAppts), 1)

    const busiest = stats.reduce((a, b) => a.weekAppts >= b.weekAppts ? a : b, stats[0])
    const topRevenue = stats.reduce((a, b) => a.revenueCompleted >= b.revenueCompleted ? a : b, stats[0])

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Comparativo de Salões</h1>
                <p className="text-muted-foreground text-sm">
                    Visão geral de todos os salões — {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
                </p>
            </div>

            {/* Destaques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {busiest && (
                    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                                    <Award className="w-4 h-4 text-amber-600" />
                                </div>
                                <CardDescription className="text-amber-700 dark:text-amber-400 font-medium">Mais movimentado esta semana</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-xl font-bold">{busiest.name}</p>
                            <p className="text-sm text-muted-foreground">{busiest.weekAppts} agendamento{busiest.weekAppts !== 1 ? "s" : ""} na semana</p>
                        </CardContent>
                    </Card>
                )}
                {topRevenue && (
                    <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                </div>
                                <CardDescription className="text-emerald-700 dark:text-emerald-400 font-medium">Maior receita realizada</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-xl font-bold">{topRevenue.name}</p>
                            <p className="text-sm text-muted-foreground">R$ {topRevenue.revenueCompleted.toFixed(0)} em serviços concluídos</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Cards por salão */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {stats.map(salon => (
                    <Card key={salon.id} className="flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Store className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{salon.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground">{salon.email}</p>
                                    </div>
                                </div>
                                {busiest?.id === salon.id && (
                                    <Badge className="bg-amber-100 text-amber-700 text-[10px] shrink-0">Top semana</Badge>
                                )}
                                {topRevenue?.id === salon.id && busiest?.id !== salon.id && (
                                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] shrink-0">Top receita</Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 space-y-4">
                            {/* KPIs */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: CalendarDays, label: "Hoje", value: salon.todayAppts, color: "text-blue-600" },
                                    { icon: CalendarDays, label: "Semana", value: salon.weekAppts, color: "text-indigo-600" },
                                    { icon: CalendarDays, label: "Mês", value: salon.monthAppts, color: "text-violet-600" },
                                    { icon: CalendarDays, label: "Total", value: salon.totalAppts, color: "text-slate-600" },
                                ].map(({ icon: Icon, label, value, color }) => (
                                    <div key={label} className="bg-muted/50 rounded-lg p-2.5 flex items-center gap-2">
                                        <Icon className={cn("w-4 h-4 shrink-0", color)} />
                                        <div>
                                            <p className="text-[11px] text-muted-foreground">{label}</p>
                                            <p className="font-bold text-sm leading-none mt-0.5">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Receita */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Receita</p>
                                <div className="flex gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-sm font-semibold text-emerald-600">R$ {salon.revenueCompleted.toFixed(0)}</span>
                                        <span className="text-xs text-muted-foreground">realizado</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-sm font-semibold text-amber-500">R$ {salon.pendingRevenue.toFixed(0)}</span>
                                        <span className="text-xs text-muted-foreground">previsto</span>
                                    </div>
                                </div>

                                {/* Bar chart — agendamentos vs max */}
                                <div className="space-y-1 mt-1">
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>Volume (semana)</span>
                                        <span>{salon.weekAppts}/{maxWeek}</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-700"
                                            style={{ width: `${(salon.weekAppts / maxWeek) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>Receita</span>
                                        <span>{salon.revenueCompleted > 0 ? `${((salon.revenueCompleted / maxRevenue) * 100).toFixed(0)}%` : "—"}</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                            style={{ width: `${(salon.revenueCompleted / maxRevenue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Equipe + serviços */}
                            <div className="flex gap-4 pt-1 border-t">
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{salon.barberCount}</span>
                                    <span className="text-xs text-muted-foreground">profissional{salon.barberCount !== 1 ? "is" : ""}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{salon.serviceCount}</span>
                                    <span className="text-xs text-muted-foreground">serviço{salon.serviceCount !== 1 ? "s" : ""}</span>
                                </div>
                                {salon.comboCount > 0 && (
                                    <Badge className="bg-violet-100 text-violet-700 text-[10px] ml-auto">
                                        {salon.comboCount} combo{salon.comboCount !== 1 ? "s" : ""}
                                    </Badge>
                                )}
                                {salon.cancelRate > 0 && (
                                    <span className="text-[10px] text-muted-foreground ml-auto">
                                        {salon.cancelRate.toFixed(0)}% cancel.
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabela comparativa resumida */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" /> Resumo comparativo
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-muted-foreground border-b">
                                <th className="text-left pb-2 font-medium">Salão</th>
                                <th className="text-center pb-2 font-medium">Profis.</th>
                                <th className="text-center pb-2 font-medium">Serviços</th>
                                <th className="text-center pb-2 font-medium">Semana</th>
                                <th className="text-center pb-2 font-medium">Total</th>
                                <th className="text-right pb-2 font-medium">Receita</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {stats.sort((a, b) => b.weekAppts - a.weekAppts).map((salon, i) => (
                                <tr key={salon.id} className={cn(i === 0 && "font-semibold")}>
                                    <td className="py-2.5 pr-4">
                                        <div className="flex items-center gap-2">
                                            {i === 0 && <span className="text-amber-500 text-xs">★</span>}
                                            {salon.name}
                                        </div>
                                    </td>
                                    <td className="py-2.5 text-center">{salon.barberCount}</td>
                                    <td className="py-2.5 text-center">{salon.serviceCount}</td>
                                    <td className="py-2.5 text-center">{salon.weekAppts}</td>
                                    <td className="py-2.5 text-center">{salon.totalAppts}</td>
                                    <td className="py-2.5 text-right text-emerald-600">R$ {salon.revenueCompleted.toFixed(0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
