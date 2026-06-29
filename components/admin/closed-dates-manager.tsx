"use client"

import * as React from "react"
import { CalendarX, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { addClosedDate, removeClosedDate } from "@/app/actions/closed-dates"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertPopover } from "@/components/ui/alert-popover"

type ClosedDate = { id: string; date: Date | string; reason: string | null }

export function ClosedDatesManager({ initialDates }: { initialDates: ClosedDate[] }) {
    const [dates, setDates] = React.useState<ClosedDate[]>(initialDates)
    const [loading, setLoading] = React.useState(false)
    const [dateInput, setDateInput] = React.useState("")
    const [reasonInput, setReasonInput] = React.useState("")

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!dateInput) return
        setLoading(true)
        try {
            const parsed = new Date(dateInput + "T12:00:00")
            const res = await addClosedDate(parsed, reasonInput || undefined)
            if (res.success && res.data) {
                setDates(prev => [...prev, res.data as ClosedDate].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
                setDateInput(""); setReasonInput("")
                toast.success("Data fechada adicionada!")
            } else toast.error(res.error || "Erro ao adicionar")
        } catch { toast.error("Data inválida") }
        finally { setLoading(false) }
    }

    const handleRemove = async (id: string) => {
        const res = await removeClosedDate(id)
        if (res.success) { setDates(prev => prev.filter(d => d.id !== id)); toast.success("Data removida.") }
        else toast.error("Erro ao remover.")
    }

    const today = new Date().toISOString().split("T")[0]

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CalendarX className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Dias Fechados</CardTitle>
                </div>
                <CardDescription>Datas em que a barbearia não funcionará. Clientes não poderão agendar nesses dias.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
                    <div className="space-y-1 flex-shrink-0">
                        <Label htmlFor="close-date">Data</Label>
                        <Input id="close-date" type="date" required min={today} value={dateInput} onChange={e => setDateInput(e.target.value)} className="w-40" />
                    </div>
                    <div className="space-y-1 flex-1">
                        <Label htmlFor="close-reason">Motivo (opcional)</Label>
                        <Input id="close-reason" placeholder="Ex: Feriado, Recesso..." value={reasonInput} onChange={e => setReasonInput(e.target.value)} />
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" disabled={loading || !dateInput} className="gap-2">
                            <Plus className="w-4 h-4" /> Adicionar
                        </Button>
                    </div>
                </form>

                <div className="space-y-2">
                    {dates.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                            Nenhum dia fechado cadastrado
                        </p>
                    ) : dates.map(d => {
                        const dateObj = new Date(d.date)
                        const isPast = dateObj < new Date()
                        return (
                            <div key={d.id} className="flex items-center justify-between gap-3 p-3 rounded-md border">
                                <div className="flex items-center gap-3 min-w-0">
                                    <CalendarX className={`w-4 h-4 shrink-0 ${isPast ? "text-muted-foreground" : "text-red-500"}`} />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-medium capitalize">
                                                {format(dateObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                            </p>
                                            {isPast && <Badge variant="secondary" className="text-[10px]">Passado</Badge>}
                                        </div>
                                        {d.reason && <p className="text-xs text-muted-foreground truncate">{d.reason}</p>}
                                    </div>
                                </div>
                                <AlertPopover
                                    title="Remover data fechada?"
                                    description={`${format(dateObj, "dd/MM/yyyy")} voltará a estar disponível para agendamentos.`}
                                    variant="danger"
                                    onConfirm={() => handleRemove(d.id)}
                                    confirmText="Remover"
                                    trigger={
                                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    }
                                />
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
