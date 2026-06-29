"use client"

import { useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Search, SlidersHorizontal } from "lucide-react"
import { AppointmentActions } from "./appointment-actions"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"

type Appointment = {
    id: string
    date: Date | string
    status: string
    customerName: string | null
    customerPhone: string | null
    service: { name: string }
    barber: { id: string; name: string | null }
    salon?: { name: string }
}

type Barber = { id: string; name: string | null }

const STATUS_OPTIONS = [
    { value: "ALL", label: "Todos os status" },
    { value: "PENDING", label: "Pendente" },
    { value: "CONFIRMED", label: "Confirmado" },
    { value: "COMPLETED", label: "Concluído" },
    { value: "CANCELLED", label: "Cancelado" },
    { value: "NO_SHOW", label: "Não compareceu" },
]

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-600",
    NO_SHOW: "bg-slate-100 text-slate-500",
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    COMPLETED: "Concluído",
    CANCELLED: "Cancelado",
    NO_SHOW: "Não compareceu",
}

export function AppointmentsTable({ appointments, barbers, showSalon }: { appointments: Appointment[]; barbers: Barber[]; showSalon?: boolean }) {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [barberFilter, setBarberFilter] = useState("ALL")

    const filtered = appointments.filter(app => {
        const matchSearch = !search || app.customerName?.toLowerCase().includes(search.toLowerCase()) || app.customerPhone?.includes(search)
        const matchStatus = statusFilter === "ALL" || app.status === statusFilter
        const matchBarber = barberFilter === "ALL" || app.barber.id === barberFilter
        return matchSearch && matchStatus && matchBarber
    })

    return (
        <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                <div className="relative flex-1 min-w-0 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cliente..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-full xs:w-40">
                            <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-muted-foreground shrink-0" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={barberFilter} onValueChange={setBarberFilter}>
                        <SelectTrigger className="h-9 w-full xs:w-44">
                            <SelectValue placeholder="Profissional" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <p className="text-xs text-muted-foreground shrink-0 sm:ml-auto">
                    {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Tabela desktop */}
            <Card className="py-0 hidden sm:block">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Profissional</TableHead>
                                {showSalon && <TableHead>Salão</TableHead>}
                                <TableHead className="text-center">Data & Hora</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length > 0 ? filtered.map(app => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <p className="font-medium text-sm">{app.customerName || "Anônimo"}</p>
                                        <p className="text-xs text-muted-foreground">{app.customerPhone || "—"}</p>
                                    </TableCell>
                                    <TableCell className="text-sm">{app.service.name}</TableCell>
                                    <TableCell className="text-sm">{app.barber.name || "—"}</TableCell>
                                    {showSalon && <TableCell className="text-sm text-muted-foreground">{app.salon?.name || "—"}</TableCell>}
                                    <TableCell className="text-center">
                                        <p className="text-sm font-medium">{format(new Date(app.date), "dd/MM/yyyy")}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(app.date), "HH:mm")}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn("text-[11px]", STATUS_STYLES[app.status] || "bg-slate-100 text-slate-500")}>
                                            {STATUS_LABELS[app.status] || app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AppointmentActions appointmentId={app.id} phone={app.customerPhone} name={app.customerName} status={app.status} />
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={showSalon ? 7 : 6} className="py-16 text-center text-muted-foreground text-sm">
                                        <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        Nenhum resultado encontrado
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Cards mobile */}
            <div className="sm:hidden space-y-2">
                {filtered.length > 0 ? filtered.map(app => {
                    const st = STATUS_STYLES[app.status] || "bg-slate-100 text-slate-500"
                    const label = STATUS_LABELS[app.status] || app.status
                    return (
                        <Card key={app.id} className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-sm truncate">{app.customerName || "Anônimo"}</p>
                                    <p className="text-xs text-muted-foreground">{app.customerPhone || "—"}</p>
                                </div>
                                <Badge className={cn("text-[10px] shrink-0", st)}>{label}</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>{app.service.name}</span>
                                <span>{app.barber.name || "—"}</span>
                                {showSalon && app.salon && <span className="text-primary font-medium">{app.salon.name}</span>}
                                <span className="font-medium text-foreground">{format(new Date(app.date), "dd/MM/yyyy 'às' HH:mm")}</span>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <AppointmentActions appointmentId={app.id} phone={app.customerPhone} name={app.customerName} status={app.status} />
                            </div>
                        </Card>
                    )
                }) : (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        Nenhum resultado encontrado
                    </div>
                )}
            </div>
        </div>
    )
}
