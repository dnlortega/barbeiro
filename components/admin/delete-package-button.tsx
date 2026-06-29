"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { deletePackage } from "@/app/actions/packages"
import { AlertPopover } from "@/components/ui/alert-popover"

export function DeletePackageButton({ packageId }: { packageId: string }) {
    const handleDelete = async () => {
        const res = await deletePackage(packageId)
        if (res.success) toast.success("Pacote excluído!")
        else toast.error(res.error || "Erro ao excluir pacote")
    }

    return (
        <AlertPopover
            title="Excluir pacote?"
            description="Isso remove o pacote do catálogo. Clientes que já compraram não serão afetados."
            variant="danger"
            onConfirm={handleDelete}
            confirmText="Excluir"
            trigger={
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            }
        />
    )
}
