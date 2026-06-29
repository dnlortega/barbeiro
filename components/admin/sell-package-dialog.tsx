"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { sellPackage } from "@/app/actions/packages"

type Package = {
    id: string
    name: string
    price: number
    items: { service: { name: string }; quantity: number }[]
}

export function SellPackageDialog({ pkg }: { pkg: Package }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [expiresAt, setExpiresAt] = useState("")

    const handleSubmit = async () => {
        if (!name || !phone) { toast.error("Nome e telefone são obrigatórios"); return }
        setLoading(true)
        const res = await sellPackage({
            packageId: pkg.id,
            customerName: name,
            customerPhone: phone,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        })
        setLoading(false)
        if (res.success) {
            toast.success(`Pacote "${pkg.name}" vendido para ${name}!`)
            setOpen(false)
            setName(""); setPhone(""); setExpiresAt("")
        } else {
            toast.error(res.error || "Erro ao registrar venda")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="shrink-0">
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Vender
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Vender pacote</DialogTitle>
                </DialogHeader>
                <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-0.5">
                    <p className="font-semibold">{pkg.name}</p>
                    <p className="text-muted-foreground text-xs">
                        {pkg.items.map(i => `${i.quantity}x ${i.service.name}`).join(" · ")}
                    </p>
                    <p className="text-primary font-bold">R$ {pkg.price.toFixed(0)}</p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nome do cliente</Label>
                        <Input placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Telefone / WhatsApp</Label>
                        <Input placeholder="(11) 99999-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Validade <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                        <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
                    </div>
                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Registrando..." : "Confirmar venda"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
