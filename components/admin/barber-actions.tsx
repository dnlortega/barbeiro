"use client"

import * as React from "react"
import { Edit, Trash2, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { toast } from "sonner"
import { deleteBarber, updateBarber } from "@/app/actions/barbers"
import { AlertPopover } from "@/components/ui/alert-popover"
import { cn } from "@/lib/utils"

type Service = { id: string; name: string; price?: number }
type Barber = {
    id: string
    name: string | null
    email: string | null
    image: string | null
    startTime: string | null
    endTime: string | null
    services: Service[]
}

export function BarberActions({ barber, allServices }: { barber: Barber; allServices: Service[] }) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    const [name, setName] = React.useState(barber.name || "")
    const [email, setEmail] = React.useState(barber.email || "")
    const [image, setImage] = React.useState(barber.image || "")
    const [startTime, setStartTime] = React.useState(barber.startTime || "09:00")
    const [endTime, setEndTime] = React.useState(barber.endTime || "19:00")
    const [selectedServices, setSelectedServices] = React.useState<string[]>(
        barber.services?.map(s => s.id) || []
    )

    const handleDelete = async () => {
        const res = await deleteBarber(barber.id)
        if (res.success) toast.success("Profissional removido!")
        else toast.error(res.error || "Erro ao remover")
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) { toast.error("Nome é obrigatório"); return }
        setLoading(true)
        try {
            const res = await updateBarber(barber.id, {
                name,
                email: email || undefined,
                image: image || undefined,
                startTime,
                endTime,
                serviceIds: selectedServices,
            })
            if (res.success) { toast.success("Perfil atualizado!"); setOpen(false) }
            else toast.error(res.error || "Erro ao atualizar")
        } catch { toast.error("Erro inesperado") }
        finally { setLoading(false) }
    }

    const toggleService = (id: string) =>
        setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

    const selectAll = () => setSelectedServices(allServices.map(s => s.id))
    const clearAll = () => setSelectedServices([])

    return (
        <div className="flex gap-1">
            <Button
                size="icon" variant="ghost" className="h-8 w-8 bg-black/20 text-white hover:bg-black/40"
                onClick={() => {
                    setName(barber.name || "")
                    setEmail(barber.email || "")
                    setImage(barber.image || "")
                    setStartTime(barber.startTime || "09:00")
                    setEndTime(barber.endTime || "19:00")
                    setSelectedServices(barber.services?.map(s => s.id) || [])
                    setOpen(true)
                }}
            >
                <Edit className="w-4 h-4" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Profissional</DialogTitle>
                        <DialogDescription>
                            Atualize os dados de {barber.name}. Profissionais não possuem acesso ao sistema.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Informações pessoais</p>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nome <span className="text-destructive">*</span></Label>
                                    <Input id="edit-name" required value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">E-mail <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                                    <Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-image">Foto (URL)</Label>
                                    <Input
                                        id="edit-image" type="url" placeholder="https://..."
                                        value={image} onChange={e => setImage(e.target.value)}
                                    />
                                    {image && (
                                        <img src={image} alt="preview"
                                            className="w-16 h-16 rounded-lg object-cover border mt-1"
                                            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Horário de trabalho</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit-start">Entrada</Label>
                                            <Input id="edit-start" type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit-end">Saída</Label>
                                            <Input id="edit-end" type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Serviços</p>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={selectAll} className="text-xs text-primary hover:underline">Todos</button>
                                        <span className="text-muted-foreground text-xs">·</span>
                                        <button type="button" onClick={clearAll} className="text-xs text-muted-foreground hover:underline">Nenhum</button>
                                    </div>
                                </div>
                                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 rounded-md border p-2">
                                    {allServices.length === 0 ? (
                                        <p className="text-sm text-muted-foreground p-2">Nenhum serviço cadastrado.</p>
                                    ) : allServices.map(s => {
                                        const selected = selectedServices.includes(s.id)
                                        return (
                                            <button
                                                type="button" key={s.id}
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
                                <p className="text-xs text-muted-foreground">
                                    {selectedServices.length} de {allServices.length} selecionados
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Salvando..." : "Salvar alterações"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertPopover
                title="Remover profissional?"
                description="O profissional será removido permanentemente. Esta ação não pode ser desfeita."
                variant="danger"
                onConfirm={handleDelete}
                confirmText="Remover"
                trigger={
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/20 text-white hover:bg-red-500/80">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                }
            />
        </div>
    )
}
