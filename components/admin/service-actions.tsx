"use client"

import { useState } from "react"
import { Edit, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { deleteService, updateService } from "@/app/actions/services"
import { AlertPopover } from "@/components/ui/alert-popover"

type Service = { id: string; name: string; price: number; duration: number; isCombo?: boolean; description?: string | null }

export function ServiceActions({ serviceId, service }: { serviceId: string; service?: Service }) {
    const [editOpen, setEditOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(service?.name ?? "")
    const [price, setPrice] = useState(String(service?.price ?? ""))
    const [duration, setDuration] = useState(String(service?.duration ?? ""))

    const handleDelete = async () => {
        const res = await deleteService(serviceId)
        if (res.success) toast.success("Serviço excluído!")
        else toast.error(res.error || "Erro ao excluir serviço")
    }

    const handleSave = async () => {
        if (!name || !price || !duration) { toast.error("Preencha todos os campos"); return }
        setLoading(true)
        const res = await updateService(serviceId, {
            name,
            price: parseFloat(price),
            duration: parseInt(duration),
            isCombo: service?.isCombo,
            description: service?.description ?? undefined,
        })
        setLoading(false)
        if (res.success) {
            toast.success("Serviço atualizado!")
            setEditOpen(false)
        } else {
            toast.error(res.error || "Erro ao atualizar serviço")
        }
    }

    return (
        <>
            <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
                    onClick={() => { setName(service?.name ?? ""); setPrice(String(service?.price ?? "")); setDuration(String(service?.duration ?? "")); setEditOpen(true) }}>
                    <Edit className="w-3.5 h-3.5" />
                </Button>
                <AlertPopover
                    title="Excluir serviço?"
                    description="Isso removerá o serviço do catálogo. Certifique-se de que não haja agendamentos vinculados."
                    variant="danger"
                    onConfirm={handleDelete}
                    confirmText="Excluir"
                    trigger={
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    }
                />
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Editar serviço</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Preço (R$)</Label>
                                <Input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Duração (min)</Label>
                                <Input type="number" min="5" step="5" value={duration} onChange={e => setDuration(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>
                                <X className="w-4 h-4 mr-1" /> Cancelar
                            </Button>
                            <Button className="flex-1" onClick={handleSave} disabled={loading}>
                                <Check className="w-4 h-4 mr-1" /> {loading ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
