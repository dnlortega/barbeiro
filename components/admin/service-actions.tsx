"use client"

import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { deleteService } from "@/app/actions/services"
import { AlertPopover } from "@/components/ui/alert-popover"

export function ServiceActions({ serviceId }: { serviceId: string }) {

    const handleDelete = async () => {
        const res = await deleteService(serviceId)
        if (res.success) {
            toast.success("Serviço excluído com sucesso!")
        } else {
            toast.error(res.error || "Erro ao excluir serviço")
        }
    }

    return (
        <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-primary rounded-xl">
                <Edit className="w-4 h-4" />
            </Button>
            <AlertPopover
                title="Excluir Serviço?"
                description="Isso removerá o serviço do catálogo. Certifique-se de que não haja agendamentos dependentes."
                variant="danger"
                onConfirm={handleDelete}
                confirmText="Excluir"
                trigger={
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-red-500 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                }
            />
        </div>
    )
}
