"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { formatPhone } from "@/lib/utils"
import { addToWaitList } from "@/app/actions/waitlist"

type Service = { id: string; name: string }
type Barber = { id: string; name: string | null }

export function AddWaitlistDialog({ services, barbers, salonId }: {
    services: Service[]
    barbers: Barber[]
    salonId: string
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [serviceId, setServiceId] = useState("")
    const [barberId, setBarberId] = useState("any")
    const [preferredDate, setPreferredDate] = useState("")

    const handleSubmit = async () => {
        if (!name || !phone || !serviceId) {
            toast.error("Nome, telefone e serviço são obrigatórios")
            return
        }
        setLoading(true)
        const res = await addToWaitList({
            customerName: name,
            customerPhone: phone,
            serviceId,
            salonId,
            barberId: barberId === "any" ? undefined : barberId,
            preferredDate: preferredDate ? new Date(preferredDate) : undefined,
        })
        setLoading(false)
        if (res.success) {
            toast.success("Cliente adicionado à fila!")
            setOpen(false)
            setName(""); setPhone(""); setServiceId(""); setBarberId("any"); setPreferredDate("")
        } else {
            toast.error(res.error || "Erro ao adicionar à fila")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Adicionar à fila
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Adicionar à Fila de Espera</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nome do cliente</Label>
                        <Input placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Telefone / WhatsApp</Label>
                        <Input placeholder="(11) 99999-9999" type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Serviço desejado</Label>
                        <Select value={serviceId} onValueChange={setServiceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um serviço" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Profissional preferido <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                        <Select value={barberId} onValueChange={setBarberId}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Qualquer profissional</SelectItem>
                                {barbers.map(b => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Data preferida <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                        <Input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} />
                    </div>
                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Adicionando..." : "Confirmar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
