"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldX, Trash2, Plus, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { addToBlacklist, removeFromBlacklist } from "@/app/actions/blacklist"
import { formatPhone } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type BlacklistedPhone = {
    id: string
    phone: string
    reason: string | null
    createdAt: Date | string
}

export function BlacklistManager({ initialList }: { initialList: BlacklistedPhone[] }) {
    const router = useRouter()
    const [list, setList] = useState(initialList)
    const [open, setOpen] = useState(false)
    const [phone, setPhone] = useState("")
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    const handleAdd = async () => {
        if (!phone.trim()) { toast.error("Informe o telefone"); return }
        setLoading(true)
        const res = await addToBlacklist(phone.trim(), reason.trim() || undefined)
        setLoading(false)
        if (res.success) {
            toast.success("Telefone bloqueado")
            setOpen(false)
            setPhone(""); setReason("")
            router.refresh()
        } else {
            toast.error(res.error || "Erro")
        }
    }

    const handleRemove = async (id: string) => {
        const res = await removeFromBlacklist(id)
        if (res.success) {
            setList(l => l.filter(x => x.id !== id))
            toast.success("Removido da lista")
        } else {
            toast.error(res.error || "Erro")
        }
    }

    const filtered = list.filter(x =>
        !search || x.phone.includes(search) || x.reason?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por telefone ou motivo..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="w-4 h-4 mr-1" /> Bloquear
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                        <DialogHeader><DialogTitle>Bloquear telefone</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Telefone</Label>
                                <Input
                                    placeholder="(11) 99999-9999"
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(formatPhone(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Motivo <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                                <Input
                                    placeholder="Ex: No-show repetido, comportamento inadequado..."
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handleAdd} disabled={loading}>
                                {loading ? "Bloqueando..." : "Confirmar bloqueio"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <ShieldX className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">{list.length === 0 ? "Nenhum telefone bloqueado." : "Nenhum resultado."}</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{filtered.length} telefone{filtered.length !== 1 ? "s" : ""} bloqueado{filtered.length !== 1 ? "s" : ""}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {filtered.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                <ShieldX className="w-4 h-4 text-destructive shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-mono text-sm font-medium">{item.phone}</p>
                                    {item.reason && <p className="text-xs text-muted-foreground truncate">{item.reason}</p>}
                                    <p className="text-[10px] text-muted-foreground">
                                        {format(new Date(item.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemove(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
