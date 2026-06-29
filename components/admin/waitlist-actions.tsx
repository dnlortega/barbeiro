"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { MessageCircle, CheckCircle, XCircle, Trash2, CalendarCheck } from "lucide-react"
import { updateWaitListStatus, deleteWaitListEntry } from "@/app/actions/waitlist"
import { AlertPopover } from "@/components/ui/alert-popover"

type Props = {
    entryId: string
    phone: string
    name: string
    service: string
    preferredDate?: string | null
}

export function WaitListActions({ entryId, phone, name, service, preferredDate }: Props) {
    const [loading, setLoading] = useState(false)

    const rawPhone = phone.replace(/\D/g, "")
    const waPhone = rawPhone.startsWith("55") ? rawPhone : `55${rawPhone}`
    const dateInfo = preferredDate ? ` para ${preferredDate}` : ""
    const waMsg = encodeURIComponent(`Olá ${name}! Temos uma vaga disponível${dateInfo} para o serviço de ${service}. Deseja confirmar?`)
    const waUrl = `https://wa.me/${waPhone}?text=${waMsg}`

    async function handleStatus(status: string, label: string) {
        setLoading(true)
        const res = await updateWaitListStatus(entryId, status)
        setLoading(false)
        if (res.success) toast.success(label)
        else toast.error(res.error || "Erro ao atualizar.")
    }

    async function handleDelete() {
        setLoading(true)
        const res = await deleteWaitListEntry(entryId)
        setLoading(false)
        if (res.success) toast.success("Removido da fila.")
        else toast.error(res.error || "Erro ao remover.")
    }

    return (
        <div className="flex items-center gap-1 justify-end">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" title="Avisar via WhatsApp">
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" />
                </a>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" disabled={loading}
                onClick={() => handleStatus("NOTIFIED", "Marcado como notificado")} title="Marcar como notificado">
                <CheckCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50" disabled={loading}
                onClick={() => handleStatus("BOOKED", "Marcado como agendado")} title="Marcar como agendado">
                <CalendarCheck className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted" disabled={loading}
                onClick={() => handleStatus("CANCELLED", "Cancelado")} title="Cancelar">
                <XCircle className="w-4 h-4" />
            </Button>
            <AlertPopover
                title={`Remover ${name} da fila?`}
                description="Esta ação não pode ser desfeita."
                variant="danger"
                onConfirm={handleDelete}
                confirmText="Remover"
                trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                }
            />
        </div>
    )
}
