"use client"

import { useState } from "react"
import { MessageSquare, Check, Trash2, ChevronDown, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointments"
import { AlertPopover } from "@/components/ui/alert-popover"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pendente", className: "text-amber-600" },
    { value: "CONFIRMED", label: "Confirmado", className: "text-emerald-600" },
    { value: "COMPLETED", label: "Concluído", className: "text-blue-600" },
    { value: "CANCELLED", label: "Cancelado", className: "text-red-600" },
    { value: "NO_SHOW", label: "Não compareceu", className: "text-slate-500" },
]

type Props = {
    appointmentId: string
    phone: string | null
    name: string | null
    status?: string
    salonName?: string
}

export function AppointmentActions({ appointmentId, phone, name, status, salonName }: Props) {
    const [loading, setLoading] = useState(false)

    const handleStatus = async (newStatus: string) => {
        setLoading(true)
        const label = STATUS_OPTIONS.find(s => s.value === newStatus)?.label ?? newStatus
        const res = await updateAppointmentStatus(appointmentId, newStatus)
        setLoading(false)
        if (res.success) toast.success(`Status: ${label}`)
        else toast.error("Erro ao atualizar status")
    }

    const handleDelete = async () => {
        const res = await deleteAppointment(appointmentId)
        if (res.success) toast.success("Agendamento excluído")
        else toast.error(res.error || "Erro ao excluir agendamento")
    }

    const handleWhatsApp = () => {
        if (!phone) { toast.error("Cliente não informou o telefone"); return }
        const clean = phone.replace(/\D/g, "")
        const shop = salonName ?? "a barbearia"
        const msg = encodeURIComponent(`Olá ${name || "cliente"}, aqui é ${shop}. Estamos te aguardando para seu agendamento!`)
        window.open(`https://wa.me/55${clean}?text=${msg}`, "_blank")
    }

    return (
        <div className="flex items-center gap-1 justify-end">
            <Button
                size="icon" variant="ghost"
                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                onClick={handleWhatsApp}
                title="WhatsApp"
            >
                <MessageSquare className="w-3.5 h-3.5" />
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" disabled={loading} className="h-8 px-2 gap-1 text-xs rounded-lg">
                        <RotateCcw className={cn("w-3 h-3", loading && "animate-spin")} />
                        Status
                        <ChevronDown className="w-3 h-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    {STATUS_OPTIONS.map(opt => (
                        <DropdownMenuItem
                            key={opt.value}
                            onClick={() => handleStatus(opt.value)}
                            className={cn("cursor-pointer", opt.className, status === opt.value && "font-bold bg-muted")}
                        >
                            {status === opt.value && <Check className="w-3 h-3 mr-1 shrink-0" />}
                            {opt.label}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <AlertPopover
                        title="Excluir agendamento?"
                        description="Esta ação é permanente e não pode ser desfeita."
                        variant="danger"
                        onConfirm={handleDelete}
                        confirmText="Excluir"
                        trigger={
                            <DropdownMenuItem
                                onSelect={e => e.preventDefault()}
                                className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                            </DropdownMenuItem>
                        }
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
