"use client"

import { useRef } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Printer, Scissors, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Pendente", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    CONFIRMED: { label: "Confirmado", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    COMPLETED: { label: "Concluído", cls: "bg-blue-100 text-blue-700 border-blue-200" },
    CANCELLED: { label: "Cancelado", cls: "bg-slate-100 text-slate-500 border-slate-200" },
    NO_SHOW: { label: "Não compareceu", cls: "bg-red-100 text-red-500 border-red-200" },
}

type Appointment = {
    id: string; date: Date | string; status: string
    customerName: string | null; customerPhone: string | null
    service: { name: string; price: number; duration: number }
    barber: { name: string | null }
    salon: { name: string }
}

export function ComandaView({ appointments, salonName, salonAddress, date, isAdmin }: {
    appointments: Appointment[]
    salonName: string
    salonAddress: string
    date: Date | string
    isAdmin: boolean
}) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const content = printRef.current?.innerHTML ?? ""
        const win = window.open("", "_blank", "width=800,height=600")
        if (!win) return
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8"/>
                <title>Comanda do Dia</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Courier New', monospace; }
                    body { background: white; color: black; padding: 16px; font-size: 12px; }
                    .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #000; padding-bottom: 12px; }
                    .header h1 { font-size: 18px; font-weight: bold; }
                    .header p { font-size: 11px; color: #555; margin-top: 2px; }
                    .section-title { font-size: 13px; font-weight: bold; margin: 12px 0 6px; border-top: 1px dashed #999; padding-top: 8px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                    th { text-align: left; font-size: 10px; font-weight: bold; border-bottom: 1px solid #000; padding: 3px 4px; }
                    td { font-size: 11px; padding: 4px 4px; vertical-align: top; border-bottom: 1px dotted #ccc; }
                    .total { text-align: right; font-size: 13px; font-weight: bold; border-top: 2px solid #000; padding-top: 6px; margin-top: 4px; }
                    .footer { text-align: center; font-size: 10px; color: #888; margin-top: 16px; border-top: 1px dashed #ccc; padding-top: 8px; }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `)
        win.document.close()
        win.focus()
        setTimeout(() => { win.print(); win.close() }, 250)
    }

    // Agrupar por barbeiro
    const grouped = new Map<string, Appointment[]>()
    for (const app of appointments) {
        const key = app.barber.name ?? "Sem nome"
        if (!grouped.has(key)) grouped.set(key, [])
        grouped.get(key)!.push(app)
    }

    const totalRevenue = appointments.filter(a => a.status === "COMPLETED").reduce((s, a) => s + a.service.price, 0)
    const totalAll = appointments.reduce((s, a) => s + a.service.price, 0)

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2 print:hidden">
                <Button size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-1" /> Imprimir Comanda
                </Button>
            </div>

            {/* KPIs rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
                {[
                    { label: "Total agendado", value: appointments.length, icon: Scissors },
                    { label: "Concluídos", value: appointments.filter(a => a.status === "COMPLETED").length, icon: Clock },
                    { label: "Receita realizada", value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign },
                    { label: "Receita potencial", value: `R$ ${totalAll.toFixed(2)}`, icon: DollarSign },
                ].map(({ label, value, icon: Icon }) => (
                    <Card key={label}>
                        <CardContent className="p-3">
                            <Icon className="w-4 h-4 text-muted-foreground mb-1" />
                            <p className="text-[11px] text-muted-foreground">{label}</p>
                            <p className="font-bold text-sm">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Conteúdo da comanda */}
            <div ref={printRef}>
                {/* Cabeçalho (visível na impressão e na tela) */}
                <div className="header mb-6 text-center border-b pb-4">
                    <h1 className="text-xl font-bold">{salonName}</h1>
                    {salonAddress && <p className="text-sm text-muted-foreground">{salonAddress}</p>}
                    <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {format(new Date(date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>

                {appointments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">
                        <Scissors className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>Nenhum agendamento hoje.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Array.from(grouped.entries()).map(([barberName, appts]) => {
                            const barberRevenue = appts.filter(a => a.status === "COMPLETED").reduce((s, a) => s + a.service.price, 0)
                            return (
                                <Card key={barberName}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center justify-between">
                                            <span>{barberName}</span>
                                            <span className="text-xs font-normal text-muted-foreground">
                                                {appts.length} agendamento{appts.length !== 1 ? "s" : ""}
                                                {" · "}R$ {barberRevenue.toFixed(2)} concluídos
                                            </span>
                                        </CardTitle>
                                        {isAdmin && appts[0] && (
                                            <p className="text-xs text-muted-foreground">{appts[0].salon.name}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {appts.map(app => {
                                                const st = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING
                                                return (
                                                    <div key={app.id} className="flex items-center gap-3 p-2 rounded border text-sm">
                                                        <div className="w-14 text-xs font-mono font-medium shrink-0">
                                                            {format(new Date(app.date), "HH:mm")}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{app.customerName || "—"}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{app.service.name} · {app.service.duration}min</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="font-semibold text-sm">R$ {app.service.price.toFixed(2)}</p>
                                                            <Badge className={cn("text-[9px] border", st.cls)}>{st.label}</Badge>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}

                        {/* Total geral */}
                        <div className="flex items-center justify-between border-t pt-4 px-1">
                            <p className="text-sm font-semibold">Total do dia (concluídos)</p>
                            <p className="text-lg font-bold">R$ {totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
