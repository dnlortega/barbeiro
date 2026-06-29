"use client"

import { useState } from "react"
import { Plus, Package, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { createService } from "@/app/actions/services"

type Service = { id: string; name: string; price: number; duration: number }

export function CreateServiceDialog({ existingServices }: { existingServices: Service[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Individual service
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [duration, setDuration] = useState("")

    // Combo
    const [comboName, setComboName] = useState("")
    const [comboDesc, setComboDesc] = useState("")
    const [comboDiscount, setComboDiscount] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const selectedServices = existingServices.filter(s => selectedIds.includes(s.id))
    const comboTotalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0)
    const comboTotalDuration = selectedServices.reduce((acc, s) => acc + s.duration, 0)
    const discountPct = parseFloat(comboDiscount) || 0
    const comboFinalPrice = comboTotalPrice * (1 - discountPct / 100)

    const toggleService = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const handleCreateIndividual = async () => {
        if (!name || !price || !duration) { toast.error("Preencha todos os campos"); return }
        setLoading(true)
        const res = await createService({ name, price: parseFloat(price), duration: parseInt(duration) })
        setLoading(false)
        if (res.success) {
            toast.success("Serviço criado!")
            setOpen(false)
            setName(""); setPrice(""); setDuration("")
        } else {
            toast.error(res.error || "Erro ao criar serviço")
        }
    }

    const handleCreateCombo = async () => {
        if (!comboName || selectedIds.length < 2) { toast.error("Escolha pelo menos 2 serviços e dê um nome ao combo"); return }
        setLoading(true)
        const description = comboDesc || selectedServices.map(s => s.name).join(" + ")
        const res = await createService({
            name: comboName,
            price: parseFloat(comboFinalPrice.toFixed(2)),
            duration: comboTotalDuration,
            isCombo: true,
            description,
        })
        setLoading(false)
        if (res.success) {
            toast.success("Combo criado!")
            setOpen(false)
            setComboName(""); setComboDesc(""); setComboDiscount(""); setSelectedIds([])
        } else {
            toast.error(res.error || "Erro ao criar combo")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex gap-2">
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                        <Package className="w-4 h-4 mr-1" /> Criar Combo
                    </Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" /> Novo Serviço
                    </Button>
                </DialogTrigger>
            </div>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Adicionar serviço</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="individual">
                    <TabsList className="w-full">
                        <TabsTrigger value="individual" className="flex-1">
                            <Scissors className="w-3.5 h-3.5 mr-1.5" /> Individual
                        </TabsTrigger>
                        <TabsTrigger value="combo" className="flex-1">
                            <Package className="w-3.5 h-3.5 mr-1.5" /> Combo
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="individual" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Nome do serviço</Label>
                            <Input placeholder="Ex: Corte de cabelo" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Preço (R$)</Label>
                                <Input type="number" min="0" step="0.01" placeholder="35.00" value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Duração (min)</Label>
                                <Input type="number" min="5" step="5" placeholder="30" value={duration} onChange={e => setDuration(e.target.value)} />
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleCreateIndividual} disabled={loading}>
                            {loading ? "Criando..." : "Criar serviço"}
                        </Button>
                    </TabsContent>

                    <TabsContent value="combo" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Nome do combo</Label>
                            <Input placeholder="Ex: Corte + Barba" value={comboName} onChange={e => setComboName(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Serviços incluídos <span className="text-muted-foreground text-xs">(mínimo 2)</span></Label>
                            <div className="border rounded-md divide-y max-h-44 overflow-y-auto">
                                {existingServices.length === 0 ? (
                                    <p className="p-3 text-sm text-muted-foreground">Cadastre serviços individuais primeiro.</p>
                                ) : existingServices.map(s => (
                                    <label key={s.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors">
                                        <Checkbox
                                            checked={selectedIds.includes(s.id)}
                                            onCheckedChange={() => toggleService(s.id)}
                                        />
                                        <span className="flex-1 text-sm">{s.name}</span>
                                        <span className="text-xs text-muted-foreground">{s.duration}min · R${s.price.toFixed(0)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {selectedIds.length >= 2 && (
                            <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total sem desconto</span>
                                    <span>R$ {comboTotalPrice.toFixed(0)} · {comboTotalDuration}min</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground shrink-0">Desconto</span>
                                    <Input
                                        type="number" min="0" max="50" step="5"
                                        placeholder="0"
                                        value={comboDiscount}
                                        onChange={e => setComboDiscount(e.target.value)}
                                        className="h-7 text-sm w-20"
                                    />
                                    <span className="text-muted-foreground">%</span>
                                    {discountPct > 0 && (
                                        <span className="ml-auto font-semibold text-primary">R$ {comboFinalPrice.toFixed(0)}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                            <Textarea
                                placeholder="Detalhes do combo..."
                                value={comboDesc}
                                onChange={e => setComboDesc(e.target.value)}
                                rows={2}
                                className="resize-none text-sm"
                            />
                        </div>

                        <Button className="w-full" onClick={handleCreateCombo} disabled={loading || selectedIds.length < 2}>
                            {loading ? "Criando..." : "Criar combo"}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
