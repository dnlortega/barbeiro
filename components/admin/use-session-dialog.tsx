"use client"

import { useState } from "react"
import { CheckCircle, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { usePackageSession, deletePackageUsage } from "@/app/actions/packages"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type Service = { id: string; name: string }
type Usage = { id: string; service: Service; usedAt: Date | string; notes?: string | null }
type Item = { service: Service; quantity: number }

type Props = {
    clientPackageId: string
    customerName: string
    items: Item[]
    usages: Usage[]
}

export function UseSessionDialog({ clientPackageId, customerName, items, usages }: Props) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [serviceId, setServiceId] = useState("")
    const [notes, setNotes] = useState("")

    const remaining = items.map(item => ({
        ...item,
        used: usages.filter(u => u.service.id === item.service.id).length,
        left: item.quantity - usages.filter(u => u.service.id === item.service.id).length,
    }))

    const availableServices = remaining.filter(r => r.left > 0)
    const totalLeft = remaining.reduce((acc, r) => acc + r.left, 0)
    const isExhausted = totalLeft === 0

    const handleUse = async () => {
        if (!serviceId) { toast.error("Selecione o serviço usado"); return }
        setLoading(true)
        const res = await usePackageSession({ clientPackageId, serviceId, notes: notes || undefined })
        setLoading(false)
        if (res.success) {
            toast.success("Sessão registrada!")
            setServiceId(""); setNotes("")
        } else {
            toast.error(res.error || "Erro ao registrar sessão")
        }
    }

    const handleRemoveUsage = async (usageId: string) => {
        const res = await deletePackageUsage(usageId)
        if (res.success) toast.success("Uso removido")
        else toast.error(res.error || "Erro ao remover uso")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant={isExhausted ? "secondary" : "default"} className="shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    {isExhausted ? "Esgotado" : "Usar sessão"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Pacote de {customerName}</DialogTitle>
                </DialogHeader>

                {/* Saldo */}
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Saldo</p>
                    <div className="grid grid-cols-2 gap-2">
                        {remaining.map(r => (
                            <div key={r.service.id} className={cn(
                                "rounded-lg border p-3",
                                r.left === 0 ? "opacity-50 bg-muted/30" : "bg-primary/5 border-primary/20"
                            )}>
                                <p className="text-xs text-muted-foreground truncate">{r.service.name}</p>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className={cn("text-2xl font-bold", r.left === 0 ? "text-muted-foreground" : "text-primary")}>
                                        {r.left}
                                    </span>
                                    <span className="text-xs text-muted-foreground">/ {r.quantity}</span>
                                </div>
                                <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                                    <div className="h-full bg-primary rounded-full"
                                        style={{ width: `${(r.left / r.quantity) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Usar sessão */}
                {!isExhausted && (
                    <div className="space-y-3 pt-1 border-t">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registrar uso</p>
                        <div className="space-y-2">
                            <Label>Serviço utilizado hoje</Label>
                            <Select value={serviceId} onValueChange={setServiceId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o serviço" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableServices.map(r => (
                                        <SelectItem key={r.service.id} value={r.service.id}>
                                            {r.service.name}
                                            <span className="text-muted-foreground ml-2">({r.left} restante{r.left !== 1 ? "s" : ""})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Observação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                            <Input placeholder="Ex: barbeiro João" value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <Button className="w-full" onClick={handleUse} disabled={loading || !serviceId}>
                            {loading ? "Registrando..." : "Confirmar uso"}
                        </Button>
                    </div>
                )}

                {/* Histórico */}
                {usages.length > 0 && (
                    <div className="space-y-2 pt-1 border-t">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Histórico de uso</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {usages.map(u => (
                                <div key={u.id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <span className="font-medium">{u.service.name}</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                            {format(new Date(u.usedAt), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                        {u.notes && <span className="text-xs text-muted-foreground ml-1">· {u.notes}</span>}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                        onClick={() => handleRemoveUsage(u.id)}>
                                        <Minus className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
