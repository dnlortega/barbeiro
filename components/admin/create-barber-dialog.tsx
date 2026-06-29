"use client"

import * as React from "react"
import { Plus, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createBarber } from "@/app/actions/barbers"
import { cn } from "@/lib/utils"

export function CreateBarberDialog({ allServices }: { allServices: { id: string; name: string }[] }) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [name, setName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [image, setImage] = React.useState("")
    const [startTime, setStartTime] = React.useState("09:00")
    const [endTime, setEndTime] = React.useState("19:00")
    const [selectedServices, setSelectedServices] = React.useState<string[]>([])

    const reset = () => { setName(""); setEmail(""); setImage(""); setStartTime("09:00"); setEndTime("19:00"); setSelectedServices([]) }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await createBarber({ name, email, startTime, endTime, image: image || undefined, serviceIds: selectedServices })
            if (res.success) {
                toast.success(`Profissional "${name}" criado com sucesso!`)
                setOpen(false); reset()
            } else toast.error(res.error || "Erro ao criar")
        } catch { toast.error("Erro inesperado") }
        finally { setLoading(false) }
    }

    const toggleService = (id: string) =>
        setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Novo Profissional
            </Button>

            <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset() }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Novo Profissional</DialogTitle>
                        <DialogDescription>Preencha os dados do profissional.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Informações</p>
                                <div className="space-y-2">
                                    <Label htmlFor="new-name">Nome</Label>
                                    <Input id="new-name" required placeholder="Ex: João Silva" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-email">E-mail (opcional)</Label>
                                    <Input id="new-email" type="email" placeholder="joao@barbearia.com" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-image">Foto (URL)</Label>
                                    <Input id="new-image" type="url" placeholder="https://..." value={image} onChange={e => setImage(e.target.value)} />
                                    {image && (
                                        <img src={image} alt="preview" className="w-12 h-12 rounded-lg object-cover border mt-1"
                                            onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                                    )}
                                </div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">Horário</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-start">Entrada</Label>
                                        <Input id="new-start" type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-end">Saída</Label>
                                        <Input id="new-end" type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Serviços</p>
                                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                    {allServices.map(s => {
                                        const selected = selectedServices.includes(s.id)
                                        return (
                                            <button
                                                type="button"
                                                key={s.id}
                                                onClick={() => toggleService(s.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-md border text-sm text-left transition-colors",
                                                    selected ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
                                                )}
                                            >
                                                <Scissors className="w-3.5 h-3.5 shrink-0" />
                                                <span className="flex-1">{s.name}</span>
                                                {selected && <Badge variant="secondary" className="text-[10px]">✓</Badge>}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Criando..." : "Criar Profissional"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
