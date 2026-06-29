"use client"

import { useState } from "react"
import { TrendingUp, Target, DollarSign, Edit2, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type BarberStat = {
    id: string
    name: string | null
    commission: number
    monthlyGoal: number | null
    revenue: number
    appointments: number
    commissionValue: number
}

async function updateBarberFields(id: string, data: { commission?: number; monthlyGoal?: number | null }) {
    const res = await fetch(`/api/barbers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    return res.ok
}

function EditableField({ value, onSave, prefix = "", suffix = "" }: {
    value: number | null
    onSave: (v: number | null) => void
    prefix?: string
    suffix?: string
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value?.toString() ?? "")

    if (!editing) {
        return (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm hover:text-primary transition-colors group">
                <span>{prefix}{value !== null ? value : "—"}{suffix}</span>
                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50" />
            </button>
        )
    }

    return (
        <div className="flex items-center gap-1">
            <Input
                className="h-7 w-24 text-xs"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                autoFocus
                type="number"
                min="0"
            />
            <button onClick={() => { onSave(draft ? parseFloat(draft) : null); setEditing(false) }}>
                <Check className="w-4 h-4 text-emerald-500" />
            </button>
            <button onClick={() => setEditing(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
            </button>
        </div>
    )
}

export function CommissionView({ barberStats }: { barberStats: BarberStat[] }) {
    const [stats, setStats] = useState(barberStats)

    const totalRevenue = stats.reduce((s, b) => s + b.revenue, 0)
    const totalCommission = stats.reduce((s, b) => s + b.commissionValue, 0)

    const handleUpdate = async (id: string, field: "commission" | "monthlyGoal", value: number | null) => {
        const ok = await updateBarberFields(id, { [field]: value })
        if (ok) {
            setStats(prev => prev.map(b => {
                if (b.id !== id) return b
                const updated = { ...b, [field]: value ?? 0 }
                updated.commissionValue = (updated.revenue * updated.commission) / 100
                return updated
            }))
            toast.success("Atualizado!")
        } else {
            toast.error("Erro ao atualizar")
        }
    }

    return (
        <div className="space-y-6">
            {/* Resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card>
                    <CardContent className="p-3">
                        <DollarSign className="w-4 h-4 text-emerald-500 mb-1" />
                        <p className="text-[11px] text-muted-foreground">Receita total (mês)</p>
                        <p className="font-bold text-lg">R$ {totalRevenue.toFixed(0)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3">
                        <TrendingUp className="w-4 h-4 text-blue-500 mb-1" />
                        <p className="text-[11px] text-muted-foreground">Total comissões</p>
                        <p className="font-bold text-lg">R$ {totalCommission.toFixed(0)}</p>
                    </CardContent>
                </Card>
                <Card className="col-span-2 sm:col-span-1">
                    <CardContent className="p-3">
                        <Target className="w-4 h-4 text-violet-500 mb-1" />
                        <p className="text-[11px] text-muted-foreground">Profissionais</p>
                        <p className="font-bold text-lg">{stats.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela por barbeiro */}
            <div className="space-y-3">
                {stats.map(b => {
                    const goalPct = b.monthlyGoal ? Math.min((b.revenue / b.monthlyGoal) * 100, 100) : null
                    return (
                        <Card key={b.id}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{b.name}</p>
                                    <Badge variant="outline" className="text-xs">{b.appointments} atend.</Badge>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-0.5">Receita</p>
                                        <p className="font-semibold text-emerald-600">R$ {b.revenue.toFixed(0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-0.5">Comissão %</p>
                                        <EditableField
                                            value={b.commission}
                                            suffix="%"
                                            onSave={v => handleUpdate(b.id, "commission", v ?? 0)}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-0.5">A receber</p>
                                        <p className="font-semibold text-blue-600">R$ {b.commissionValue.toFixed(0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground mb-0.5">Meta mensal</p>
                                        <EditableField
                                            value={b.monthlyGoal}
                                            prefix="R$ "
                                            onSave={v => handleUpdate(b.id, "monthlyGoal", v)}
                                        />
                                    </div>
                                </div>
                                {goalPct !== null && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                            <span>Progresso da meta</span>
                                            <span>{goalPct.toFixed(0)}%</span>
                                        </div>
                                        <Progress value={goalPct} className={cn("h-1.5", goalPct >= 100 ? "bg-emerald-100" : "")} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
