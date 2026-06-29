"use client"

import { useState, useMemo } from "react"
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Download, Calendar, TrendingUp, DollarSign, Users, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendente", CONFIRMED: "Confirmado", COMPLETED: "Concluído",
    CANCELLED: "Cancelado", NO_SHOW: "Não compareceu",
}

type Appointment = {
    id: string; date: Date | string; status: string
    customerName: string | null; customerPhone: string | null
    service: { name: string; price: number }
    barber: { name: string | null }
    salon: { name: string }
}

const QUICK_RANGES = [
    { label: "Hoje", getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
    { label: "Ontem", getValue: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
    { label: "7 dias", getValue: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
    { label: "30 dias", getValue: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
    { label: "Este mês", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
]

export function ReportExport({ appointments, isAdmin }: { appointments: Appointment[]; isAdmin: boolean }) {
    const [fromStr, setFromStr] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
    const [toStr, setToStr] = useState(format(new Date(), "yyyy-MM-dd"))
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [barberFilter, setBarberFilter] = useState("ALL")

    const applyQuickRange = (range: { from: Date; to: Date }) => {
        setFromStr(format(range.from, "yyyy-MM-dd"))
        setToStr(format(range.to, "yyyy-MM-dd"))
    }

    const barbers = useMemo(() => {
        const names = [...new Set(appointments.map(a => a.barber.name ?? "—"))]
        return names.sort()
    }, [appointments])

    const filtered = useMemo(() => {
        const from = new Date(fromStr + "T00:00:00")
        const to = new Date(toStr + "T23:59:59")
        return appointments.filter(a => {
            const d = new Date(a.date)
            if (d < from || d > to) return false
            if (statusFilter !== "ALL" && a.status !== statusFilter) return false
            if (barberFilter !== "ALL" && a.barber.name !== barberFilter) return false
            return true
        })
    }, [appointments, fromStr, toStr, statusFilter, barberFilter])

    const stats = useMemo(() => {
        const completed = filtered.filter(a => a.status === "COMPLETED")
        const revenue = completed.reduce((acc, a) => acc + a.service.price, 0)
        const clients = new Set(filtered.map(a => a.customerPhone).filter(Boolean)).size
        const topService = (() => {
            const counts: Record<string, number> = {}
            completed.forEach(a => { counts[a.service.name] = (counts[a.service.name] || 0) + 1 })
            const top = Object.entries(counts).sort((x, y) => y[1] - x[1])[0]
            return top ? top[0] : "—"
        })()
        return { total: filtered.length, completed: completed.length, revenue, clients, topService }
    }, [filtered])

    const exportCSV = () => {
        const header = ["Data", "Hora", "Cliente", "Telefone", "Serviço", "Valor", "Profissional", "Status", ...(isAdmin ? ["Salão"] : [])]
        const rows = filtered.map(a => [
            format(new Date(a.date), "dd/MM/yyyy"),
            format(new Date(a.date), "HH:mm"),
            a.customerName ?? "",
            a.customerPhone ?? "",
            a.service.name,
            a.service.price.toFixed(2),
            a.barber.name ?? "",
            STATUS_LABELS[a.status] ?? a.status,
            ...(isAdmin ? [a.salon.name] : []),
        ])
        const csv = [header, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `relatorio_${fromStr}_${toStr}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Período e Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Atalhos de período */}
                    <div className="flex flex-wrap gap-2">
                        {QUICK_RANGES.map(r => (
                            <Button key={r.label} size="sm" variant="outline" onClick={() => applyQuickRange(r.getValue())}>
                                {r.label}
                            </Button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">De</Label>
                            <Input type="date" value={fromStr} onChange={e => setFromStr(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Até</Label>
                            <Input type="date" value={toStr} onChange={e => setToStr(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                        <SelectItem key={k} value={k}>{v}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Profissional</Label>
                            <Select value={barberFilter} onValueChange={setBarberFilter}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    {barbers.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                    { icon: Calendar, label: "Total", value: stats.total, color: "text-primary" },
                    { icon: TrendingUp, label: "Concluídos", value: stats.completed, color: "text-emerald-600" },
                    { icon: DollarSign, label: "Receita", value: `R$ ${stats.revenue.toFixed(0)}`, color: "text-blue-600" },
                    { icon: Users, label: "Clientes únicos", value: stats.clients, color: "text-violet-600" },
                    { icon: Scissors, label: "Serviço top", value: stats.topService, color: "text-amber-600" },
                ].map(({ icon: Icon, label, value, color }) => (
                    <Card key={label}>
                        <CardContent className="p-3 flex flex-col gap-1">
                            <Icon className={cn("w-4 h-4", color)} />
                            <p className="text-[11px] text-muted-foreground">{label}</p>
                            <p className={cn("font-bold text-sm truncate", color)}>{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabela + export */}
            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm">{filtered.length} agendamento{filtered.length !== 1 ? "s" : ""}</CardTitle>
                    <Button size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
                        <Download className="w-4 h-4 mr-1" /> Exportar CSV
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Mobile: cards */}
                    <div className="sm:hidden space-y-2">
                        {filtered.slice(0, 50).map(app => (
                            <div key={app.id} className="p-3 rounded-lg border space-y-1">
                                <div className="flex justify-between">
                                    <p className="text-sm font-medium">{app.customerName || "—"}</p>
                                    <Badge variant="outline" className="text-[10px]">{STATUS_LABELS[app.status]}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{format(new Date(app.date), "dd/MM/yyyy HH:mm")}</p>
                                <p className="text-xs">{app.service.name} · {app.barber.name}</p>
                                <p className="text-xs font-semibold">R$ {app.service.price.toFixed(2)}</p>
                            </div>
                        ))}
                        {filtered.length > 50 && <p className="text-xs text-center text-muted-foreground">Exporte o CSV para ver todos os registros.</p>}
                    </div>

                    {/* Desktop: tabela */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b">
                                    {["Data", "Cliente", "Serviço", "Profissional", ...(isAdmin ? ["Salão"] : []), "Valor", "Status"].map(h => (
                                        <th key={h} className="py-2 px-2 text-left text-muted-foreground font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.slice(0, 200).map(app => (
                                    <tr key={app.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="py-2 px-2 whitespace-nowrap">{format(new Date(app.date), "dd/MM/yy HH:mm")}</td>
                                        <td className="py-2 px-2">
                                            <div>{app.customerName || "—"}</div>
                                            {app.customerPhone && <div className="text-muted-foreground">{app.customerPhone}</div>}
                                        </td>
                                        <td className="py-2 px-2">{app.service.name}</td>
                                        <td className="py-2 px-2">{app.barber.name}</td>
                                        {isAdmin && <td className="py-2 px-2">{app.salon.name}</td>}
                                        <td className="py-2 px-2 font-semibold">R$ {app.service.price.toFixed(2)}</td>
                                        <td className="py-2 px-2">
                                            <Badge variant="outline" className="text-[10px]">{STATUS_LABELS[app.status]}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length > 200 && (
                            <p className="text-xs text-center text-muted-foreground py-2">
                                Mostrando 200 de {filtered.length}. Exporte o CSV para todos.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
