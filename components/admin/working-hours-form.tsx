"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { saveWorkingHours } from "@/app/actions/working-hours"

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

type WorkingDay = {
    id: string
    dayOfWeek: number
    isOpen: boolean
    openTime: string
    closeTime: string
}

export function WorkingHoursForm({ initialHours }: { initialHours: WorkingDay[] }) {
    const [hours, setHours] = useState(initialHours)
    const [loading, setLoading] = useState(false)

    const update = (day: number, field: keyof WorkingDay, value: string | boolean) => {
        setHours(h => h.map(d => d.dayOfWeek === day ? { ...d, [field]: value } : d))
    }

    const handleSave = async () => {
        setLoading(true)
        const res = await saveWorkingHours(hours.map(h => ({
            dayOfWeek: h.dayOfWeek,
            isOpen: h.isOpen,
            openTime: h.openTime,
            closeTime: h.closeTime,
        })))
        setLoading(false)
        if (res.success) toast.success("Horários salvos!")
        else toast.error(res.error || "Erro ao salvar")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Horário de Funcionamento
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Configure os dias e horários em que o salão aceita agendamentos.
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {hours.map(day => (
                    <div key={day.dayOfWeek} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <Switch
                            checked={day.isOpen}
                            onCheckedChange={v => update(day.dayOfWeek, "isOpen", v)}
                        />
                        <Label className={`w-20 text-sm font-medium ${!day.isOpen ? "text-muted-foreground" : ""}`}>
                            {DAY_NAMES[day.dayOfWeek]}
                        </Label>
                        {day.isOpen ? (
                            <div className="flex items-center gap-2 flex-1">
                                <Input
                                    type="time"
                                    value={day.openTime}
                                    onChange={e => update(day.dayOfWeek, "openTime", e.target.value)}
                                    className="w-32"
                                />
                                <span className="text-muted-foreground text-sm">até</span>
                                <Input
                                    type="time"
                                    value={day.closeTime}
                                    onChange={e => update(day.dayOfWeek, "closeTime", e.target.value)}
                                    className="w-32"
                                />
                            </div>
                        ) : (
                            <span className="text-sm text-muted-foreground italic">Fechado</span>
                        )}
                    </div>
                ))}
                <Button onClick={handleSave} disabled={loading} className="w-full mt-2">
                    {loading ? "Salvando..." : "Salvar horários"}
                </Button>
            </CardContent>
        </Card>
    )
}
