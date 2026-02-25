"use client"

import { MessageSquare, Check, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointments"
import { AlertPopover } from "@/components/ui/alert-popover"

export function AppointmentActions({ appointmentId, phone, name }: { appointmentId: string, phone: string | null, name: string | null }) {

    const handleStatus = async (status: string) => {
        const res = await updateAppointmentStatus(appointmentId, status)
        if (res.success) {
            toast.success(`Status atualizado para ${status}`)
        } else {
            toast.error("Erro ao atualizar status")
        }
    }

    const handleDelete = async () => {
        const res = await deleteAppointment(appointmentId)
        if (res.success) {
            toast.success("Agendamento excluído com sucesso!")
        } else {
            toast.error(res.error || "Erro ao excluir agendamento")
        }
    }

    const handleWhatsApp = () => {
        if (!phone) {
            toast.error("Cliente não informou o telefone")
            return
        }

        // Formatar número (remover tudo que não é dígito)
        const cleanPhone = phone.replace(/\D/g, "")
        const message = encodeURIComponent(`Olá ${name || 'cliente'}, aqui é da Barbearia Premium. Estamos te aguardando para seu agendamento!`)
        window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank")
    }

    return (
        <div className="flex gap-2 justify-end">
            <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl"
                onClick={handleWhatsApp}
                title="Mandar WhatsApp"
            >
                <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-xl"
                onClick={() => handleStatus("CONFIRMED")}
                title="Confirmar"
            >
                <Check className="w-4 h-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-100 rounded-xl"
                onClick={() => handleStatus("CANCELLED")}
                title="Cancelar (Mudar Status)"
            >
                <X className="w-4 h-4" />
            </Button>

            <AlertPopover
                title="Excluir Registro?"
                description="Esta ação é permanente e removerá o agendamento do banco de dados."
                variant="danger"
                onConfirm={handleDelete}
                confirmText="Excluir"
                trigger={
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl"
                        title="Excluir Permanentemente"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                }
            />
        </div>
    )
}
