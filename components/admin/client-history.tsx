"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Search, Star, Phone, Calendar, DollarSign, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Pendente", cls: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: "Confirmado", cls: "bg-emerald-100 text-emerald-700" },
    COMPLETED: { label: "Concluído", cls: "bg-blue-100 text-blue-700" },
    CANCELLED: { label: "Cancelado", cls: "bg-slate-100 text-slate-500" },
    NO_SHOW: { label: "Não compareceu", cls: "bg-red-100 text-red-500" },
}

type ClientData = {
    phone: string
    name: string
    appointments: {
        id: string; date: Date | string; status: string; customerName: string | null
        service: { name: string; price: number }
        barber: { name: string | null }
        salon: { name: string }
        rating: number | null; ratingNote: string | null
    }[]
    totalSpent: number
    totalVisits: number
    lastVisit: Date | string
    rating: number | null
}

export function ClientHistory({ clients }: { clients: ClientData[] }) {
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<ClientData | null>(null)

    const filtered = clients.filter(c =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    )

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lista de clientes */}
            <div className="lg:col-span-1 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou telefone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                    {filtered.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">Nenhum cliente encontrado</p>
                    )}
                    {filtered.map(client => (
                        <Card
                            key={client.phone}
                            onClick={() => setSelected(client)}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                selected?.phone === client.phone && "ring-2 ring-primary"
                            )}
                        >
                            <CardContent className="p-3 space-y-1">
                                <div className="flex items-start justify-between">
                                    <p className="font-semibold text-sm">{client.name}</p>
                                    {client.totalVisits > 4 && (
                                        <Badge className="bg-amber-100 text-amber-700 text-[10px]">Fiel</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {client.phone}
                                </p>
                                <div className="flex gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {client.totalVisits} visita{client.totalVisits !== 1 ? "s" : ""}</span>
                                    <span className="flex items-center gap-0.5"><DollarSign className="w-3 h-3" /> R$ {client.totalSpent.toFixed(0)}</span>
                                    {client.rating && (
                                        <span className="flex items-center gap-0.5 text-amber-500">
                                            <Star className="w-3 h-3 fill-amber-500" /> {client.rating.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Detalhes do cliente */}
            <div className="lg:col-span-2">
                {!selected ? (
                    <Card className="h-full flex items-center justify-center">
                        <CardContent className="text-center text-muted-foreground py-16">
                            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Selecione um cliente para ver o histórico</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {/* KPIs */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span>{selected.name}</span>
                                    {selected.totalVisits > 4 && (
                                        <Badge className="bg-amber-100 text-amber-700">Cliente Fiel ⭐</Badge>
                                    )}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">{selected.phone}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: "Visitas", value: selected.totalVisits },
                                        { label: "Total gasto", value: `R$ ${selected.totalSpent.toFixed(0)}` },
                                        { label: "Última visita", value: format(new Date(selected.lastVisit), "dd/MM/yy", { locale: ptBR }) },
                                        { label: "Avaliação média", value: selected.rating ? `${selected.rating.toFixed(1)} ★` : "—" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="bg-muted/50 rounded-lg p-2.5 text-center">
                                            <p className="text-[11px] text-muted-foreground">{label}</p>
                                            <p className="font-bold text-sm mt-0.5">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Histórico de agendamentos */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Todos os agendamentos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                                {selected.appointments.map(app => {
                                    const st = STATUS_MAP[app.status] || STATUS_MAP.PENDING
                                    return (
                                        <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-lg border">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{app.service.name}</p>
                                                    <Badge className={cn("text-[10px] shrink-0", st.cls)}>{st.label}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(app.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                    {" · "}{app.barber.name}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-semibold">R$ {app.service.price.toFixed(0)}</p>
                                                {app.rating && (
                                                    <p className="text-xs text-amber-500">{"★".repeat(app.rating)}</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
