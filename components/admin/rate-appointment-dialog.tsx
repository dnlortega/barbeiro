"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { rateAppointment } from "@/app/actions/ratings"
import { cn } from "@/lib/utils"

export function RateAppointmentDialog({ appointmentId, currentRating, children }: {
    appointmentId: string
    currentRating?: number | null
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState(currentRating ?? 0)
    const [hover, setHover] = useState(0)
    const [note, setNote] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!rating) { toast.error("Selecione uma avaliação"); return }
        setLoading(true)
        const res = await rateAppointment(appointmentId, rating, note || undefined)
        setLoading(false)
        if (res.success) { toast.success("Avaliação registrada!"); setOpen(false) }
        else toast.error(res.error || "Erro ao salvar avaliação")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Avaliar atendimento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex justify-center gap-1 py-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8 transition-colors",
                                        star <= (hover || rating)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-muted-foreground"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                        {["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente"][hover || rating] || "Selecione uma nota"}
                    </p>
                    <div className="space-y-1.5">
                        <Label>Observação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                        <Textarea
                            placeholder="Ex: Cliente muito satisfeito, pediu para retornar em 3 semanas..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <Button className="w-full" onClick={handleSubmit} disabled={loading || !rating}>
                        {loading ? "Salvando..." : "Confirmar avaliação"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
