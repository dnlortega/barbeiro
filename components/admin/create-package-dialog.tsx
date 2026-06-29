"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createPackage } from "@/app/actions/packages"

type Service = { id: string; name: string; price: number; duration: number }
type Item = { serviceId: string; quantity: number }

export function CreatePackageDialog({ services }: { services: Service[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")
    const [items, setItems] = useState<Item[]>([{ serviceId: "", quantity: 1 }])

    const addItem = () => setItems(prev => [...prev, { serviceId: "", quantity: 1 }])
    const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
    const updateItem = (i: number, field: keyof Item, value: string | number) =>
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

    const suggestedPrice = items.reduce((acc, item) => {
        const svc = services.find(s => s.id === item.serviceId)
        return acc + (svc ? svc.price * item.quantity : 0)
    }, 0)

    const handleSubmit = async () => {
        if (!name || !price) { toast.error("Informe o nome e o preço do pacote"); return }
        const validItems = items.filter(i => i.serviceId && i.quantity > 0)
        if (validItems.length === 0) { toast.error("Adicione pelo menos um serviço ao pacote"); return }

        setLoading(true)
        const res = await createPackage({
            name,
            price: parseFloat(price),
            description: description || undefined,
            items: validItems,
        })
        setLoading(false)

        if (res.success) {
            toast.success("Pacote criado!")
            setOpen(false)
            setName(""); setPrice(""); setDescription("")
            setItems([{ serviceId: "", quantity: 1 }])
        } else {
            toast.error(res.error || "Erro ao criar pacote")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Novo Pacote
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Criar pacote de sessões</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nome do pacote</Label>
                        <Input placeholder="Ex: Fidelidade Ouro" value={name} onChange={e => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Serviços incluídos</Label>
                        <div className="space-y-2">
                            {items.map((item, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <Select value={item.serviceId} onValueChange={v => updateItem(i, "serviceId", v)}>
                                        <SelectTrigger className="flex-1 h-9">
                                            <SelectValue placeholder="Serviço" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map(s => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {s.name} <span className="text-muted-foreground text-xs">R${s.price.toFixed(0)}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="outline" size="icon" className="h-9 w-9 text-xs font-bold"
                                            onClick={() => updateItem(i, "quantity", Math.max(1, item.quantity - 1))}>−</Button>
                                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                                        <Button variant="outline" size="icon" className="h-9 w-9 text-xs font-bold"
                                            onClick={() => updateItem(i, "quantity", item.quantity + 1)}>+</Button>
                                    </div>
                                    {items.length > 1 && (
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-600 shrink-0"
                                            onClick={() => removeItem(i)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" className="w-full" onClick={addItem}>
                            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar serviço
                        </Button>
                    </div>

                    {suggestedPrice > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Valor cheio: R$ {suggestedPrice.toFixed(0)} — defina um preço com desconto abaixo.
                        </p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Preço do pacote (R$)</Label>
                            <Input type="number" min="0" step="0.01" placeholder="150.00" value={price}
                                onChange={e => setPrice(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                            <Input placeholder="Detalhes..." value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                    </div>

                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Criando..." : "Criar pacote"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
