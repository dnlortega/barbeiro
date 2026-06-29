"use client"

import { useState } from "react"
import { format, addMinutes, setHours, setMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { createTimeBlock, deleteTimeBlock } from "@/app/actions/timeblocks"

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-400",
    CONFIRMED: "bg-emerald-400",
    COMPLETED: "bg-blue-400",
    NO_SHOW: "bg-slate-300",
}

const START_HOUR = 8
const END_HOUR = 20
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60
const PIXELS_PER_MIN = 2.5

type Barber = { id: string; name: string | null; salon?: { name: string } | null }
type Appointment = {
    id: string; date: Date | string; status: string
    service: { name: string; duration: number; price: number }
    barber: { id: string; name: string | null }
    customerName: string | null; customerPhone: string | null
}
type TimeBlock = {
    id: string; startTime: string; endTime: string; reason: string | null
    barber: { id: string; name: string | null }
}

function minutesFromStart(date: Date | string) {
    const d = new Date(date)
    return (d.getHours() - START_HOUR) * 60 + d.getMinutes()
}

function timeToMinutes(time: string) {
    const [h, m] = time.split(":").map(Number)
    return (h - START_HOUR) * 60 + m
}

export function TimelineView({ barbers, appointments, timeBlocks, salonId, isAdmin }: {
    barbers: Barber[]
    appointments: Appointment[]
    timeBlocks: TimeBlock[]
    salonId: string
    isAdmin: boolean
}) {
    const [blockOpen, setBlockOpen] = useState(false)
    const [blockBarber, setBlockBarber] = useState("")
    const [blockStart, setBlockStart] = useState("12:00")
    const [blockEnd, setBlockEnd] = useState("13:00")
    const [blockReason, setBlockReason] = useState("")
    const [loading, setLoading] = useState(false)

    const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

    const handleCreateBlock = async () => {
        if (!blockBarber || !blockStart || !blockEnd) { toast.error("Preencha todos os campos"); return }
        setLoading(true)
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const res = await createTimeBlock({
            barberId: blockBarber, date: today,
            startTime: blockStart, endTime: blockEnd,
            reason: blockReason || undefined,
        })
        setLoading(false)
        if (res.success) { toast.success("Bloqueio criado!"); setBlockOpen(false); setBlockReason("") }
        else toast.error(res.error || "Erro ao criar bloqueio")
    }

    const handleDeleteBlock = async (id: string) => {
        const res = await deleteTimeBlock(id)
        if (res.success) toast.success("Bloqueio removido")
        else toast.error(res.error || "Erro")
    }

    const now = new Date()
    const nowMinutes = minutesFromStart(now)
    const showNow = nowMinutes >= 0 && nowMinutes <= TOTAL_MINUTES

    return (
        <div className="space-y-4">
            {!isAdmin && (
                <div className="flex justify-end">
                    <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Lock className="w-4 h-4 mr-1" /> Bloquear Horário
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                            <DialogHeader><DialogTitle>Bloquear horário</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Profissional</Label>
                                    <Select value={blockBarber} onValueChange={setBlockBarber}>
                                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                        <SelectContent>
                                            {barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Início</Label>
                                        <Input type="time" value={blockStart} onChange={e => setBlockStart(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fim</Label>
                                        <Input type="time" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Motivo <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                                    <Input placeholder="Ex: Almoço, Reunião..." value={blockReason} onChange={e => setBlockReason(e.target.value)} />
                                </div>
                                <Button className="w-full" onClick={handleCreateBlock} disabled={loading}>
                                    {loading ? "Bloqueando..." : "Confirmar bloqueio"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    {/* Header — barbeiros */}
                    <div className="grid" style={{ gridTemplateColumns: `64px repeat(${barbers.length}, minmax(120px, 1fr))` }}>
                        <div />
                        {barbers.map(b => (
                            <div key={b.id} className="px-2 pb-2 text-center">
                                <p className="text-xs font-semibold truncate">{b.name}</p>
                                {isAdmin && b.salon && <p className="text-[10px] text-muted-foreground truncate">{b.salon.name}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Grade de horários */}
                    <div className="relative border rounded-lg overflow-hidden bg-muted/20">
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `64px repeat(${barbers.length}, minmax(120px, 1fr))`,
                                height: `${TOTAL_MINUTES * PIXELS_PER_MIN}px`,
                            }}
                        >
                            {/* Coluna de horas */}
                            <div className="relative border-r bg-background">
                                {hours.map(h => (
                                    <div
                                        key={h}
                                        className="absolute w-full flex items-start justify-end pr-2"
                                        style={{ top: `${(h - START_HOUR) * 60 * PIXELS_PER_MIN}px`, height: `${60 * PIXELS_PER_MIN}px` }}
                                    >
                                        <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{h}:00</span>
                                    </div>
                                ))}
                            </div>

                            {/* Colunas por barbeiro */}
                            {barbers.map(barber => {
                                const barberAppts = appointments.filter(a => a.barber.id === barber.id)
                                const barberBlocks = timeBlocks.filter(b => b.barber.id === barber.id)

                                return (
                                    <div key={barber.id} className="relative border-l">
                                        {/* Linhas de hora */}
                                        {hours.map(h => (
                                            <div
                                                key={h}
                                                className="absolute w-full border-t border-border/30"
                                                style={{ top: `${(h - START_HOUR) * 60 * PIXELS_PER_MIN}px` }}
                                            />
                                        ))}

                                        {/* Bloqueios */}
                                        {barberBlocks.map(block => {
                                            const top = timeToMinutes(block.startTime)
                                            const blockEnd = timeToMinutes(block.endTime)
                                            const height = Math.max((blockEnd - top) * PIXELS_PER_MIN, 20)
                                            if (top < 0) return null
                                            return (
                                                <div
                                                    key={block.id}
                                                    className="absolute left-1 right-1 rounded bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-start gap-1 p-1 group overflow-hidden"
                                                    style={{ top: `${top * PIXELS_PER_MIN}px`, height: `${height}px` }}
                                                >
                                                    <Lock className="w-2.5 h-2.5 text-slate-500 mt-0.5 shrink-0" />
                                                    <p className="text-[9px] text-slate-500 truncate flex-1">{block.reason || "Bloqueado"}</p>
                                                    {!isAdmin && (
                                                        <button
                                                            onClick={() => handleDeleteBlock(block.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                                                        >
                                                            <Trash2 className="w-2.5 h-2.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })}

                                        {/* Agendamentos */}
                                        {barberAppts.map(app => {
                                            const top = minutesFromStart(app.date)
                                            const height = Math.max(app.service.duration * PIXELS_PER_MIN - 2, 20)
                                            if (top < 0 || top > TOTAL_MINUTES) return null
                                            const color = STATUS_COLORS[app.status] || "bg-primary"
                                            return (
                                                <div
                                                    key={app.id}
                                                    className={cn("absolute left-1 right-1 rounded-md p-1.5 text-white overflow-hidden shadow-sm", color)}
                                                    style={{ top: `${top * PIXELS_PER_MIN}px`, height: `${height}px` }}
                                                    title={`${app.customerName} — ${app.service.name} (${app.service.duration}min)`}
                                                >
                                                    <p className="text-[10px] font-bold leading-tight truncate">{app.customerName || "Anônimo"}</p>
                                                    {height > 30 && <p className="text-[9px] opacity-80 truncate">{app.service.name}</p>}
                                                    {height > 48 && <p className="text-[9px] opacity-70">{format(new Date(app.date), "HH:mm")}</p>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Linha do horário atual */}
                        {showNow && (
                            <div
                                className="absolute left-0 right-0 pointer-events-none z-10 flex items-center"
                                style={{ top: `${nowMinutes * PIXELS_PER_MIN}px` }}
                            >
                                <div className="w-16 text-right pr-1">
                                    <span className="text-[9px] font-bold text-red-500">{format(now, "HH:mm")}</span>
                                </div>
                                <div className="flex-1 h-0.5 bg-red-500" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-3 text-xs">
                {[
                    { color: "bg-amber-400", label: "Pendente" },
                    { color: "bg-emerald-400", label: "Confirmado" },
                    { color: "bg-blue-400", label: "Concluído" },
                    { color: "bg-slate-300", label: "Não compareceu" },
                    { color: "bg-slate-200 border", label: "Bloqueado" },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className={cn("w-3 h-3 rounded-sm", color)} />
                        <span className="text-muted-foreground">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
