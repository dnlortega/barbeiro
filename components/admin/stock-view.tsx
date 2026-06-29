"use client"

import { useState } from "react"
import { Package, Plus, TrendingUp, TrendingDown, AlertTriangle, ArrowUpDown, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createStockItem, addStockTransaction, deleteStockItem } from "@/app/actions/stock"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

type Transaction = { id: string; type: string; quantity: number; notes: string | null; createdAt: Date | string }
type StockItem = {
    id: string; name: string; unit: string; quantity: number
    minQuantity: number; costPrice: number | null
    transactions: Transaction[]
}

function MovementDialog({ item }: { item: StockItem }) {
    const [open, setOpen] = useState(false)
    const [type, setType] = useState<"IN" | "OUT" | "ADJUST">("IN")
    const [qty, setQty] = useState("")
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        const q = parseFloat(qty)
        if (!q || q <= 0) { toast.error("Quantidade inválida"); return }
        setLoading(true)
        const res = await addStockTransaction(item.id, type, q, notes || undefined)
        setLoading(false)
        if (res.success) { toast.success("Movimentação registrada!"); setOpen(false); setQty(""); setNotes(""); window.location.reload() }
        else toast.error(res.error || "Erro")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1" /> Movimentar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Movimentar: {item.name}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Tipo</Label>
                        <Select value={type} onValueChange={v => setType(v as "IN" | "OUT" | "ADJUST")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IN">Entrada</SelectItem>
                                <SelectItem value="OUT">Saída</SelectItem>
                                <SelectItem value="ADJUST">Ajuste de inventário</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>{type === "ADJUST" ? "Nova quantidade total" : "Quantidade"}</Label>
                        <Input type="number" min="0" step="0.1" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Observação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: Compra, uso no dia, perda..." />
                    </div>
                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Salvando..." : "Confirmar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function CreateItemDialog() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [unit, setUnit] = useState("un")
    const [qty, setQty] = useState("0")
    const [minQty, setMinQty] = useState("1")
    const [costPrice, setCostPrice] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!name.trim()) { toast.error("Informe o nome"); return }
        setLoading(true)
        const res = await createStockItem({
            name: name.trim(), unit,
            quantity: parseFloat(qty) || 0,
            minQuantity: parseFloat(minQty) || 1,
            costPrice: costPrice ? parseFloat(costPrice) : undefined,
        })
        setLoading(false)
        if (res.success) { toast.success("Item criado!"); setOpen(false); window.location.reload() }
        else toast.error(res.error || "Erro")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Novo item</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Adicionar item ao estoque</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Nome</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Pomada modeladora, Shampoo..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Unidade</Label>
                            <Select value={unit} onValueChange={setUnit}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["un", "ml", "L", "g", "kg", "cx", "pct"].map(u => (
                                        <SelectItem key={u} value={u}>{u}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Qtd inicial</Label>
                            <Input type="number" min="0" value={qty} onChange={e => setQty(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Qtd mínima</Label>
                            <Input type="number" min="0" value={minQty} onChange={e => setMinQty(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Preço de custo <span className="text-muted-foreground text-xs">(R$)</span></Label>
                            <Input type="number" min="0" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0,00" />
                        </div>
                    </div>
                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Criando..." : "Adicionar ao estoque"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function StockView({ items }: { items: StockItem[] }) {
    const [selected, setSelected] = useState<StockItem | null>(null)
    const lowStock = items.filter(i => i.quantity <= i.minQuantity)
    const totalValue = items.reduce((s, i) => s + i.quantity * (i.costPrice ?? 0), 0)

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card>
                    <CardContent className="p-3">
                        <Package className="w-4 h-4 text-primary mb-1" />
                        <p className="text-[11px] text-muted-foreground">Itens cadastrados</p>
                        <p className="font-bold text-lg">{items.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mb-1" />
                        <p className="text-[11px] text-muted-foreground">Estoque baixo</p>
                        <p className="font-bold text-lg text-amber-500">{lowStock.length}</p>
                    </CardContent>
                </Card>
                <Card className="col-span-2 sm:col-span-1">
                    <CardContent className="p-3">
                        <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                        <p className="text-[11px] text-muted-foreground">Valor em estoque</p>
                        <p className="font-bold text-lg">R$ {totalValue.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alerta estoque baixo */}
            {lowStock.length > 0 && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="p-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Estoque baixo</p>
                            <p className="text-xs text-amber-600 dark:text-amber-500">
                                {lowStock.map(i => i.name).join(", ")}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Lista de itens */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                        <CreateItemDialog />
                    </div>
                    {items.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Nenhum item no estoque.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {items.map(item => {
                                const low = item.quantity <= item.minQuantity
                                return (
                                    <Card
                                        key={item.id}
                                        onClick={() => setSelected(item)}
                                        className={cn("cursor-pointer transition-all hover:shadow-md", selected?.id === item.id && "ring-2 ring-primary")}
                                    >
                                        <CardContent className="p-3 flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                                    {low && <Badge className="bg-amber-100 text-amber-700 text-[10px]">Baixo</Badge>}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Mín: {item.minQuantity} {item.unit}
                                                    {item.costPrice && ` · R$ ${item.costPrice.toFixed(2)}/un`}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={cn("font-bold text-lg", low ? "text-amber-500" : "text-primary")}>
                                                    {item.quantity}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{item.unit}</p>
                                            </div>
                                            <MovementDialog item={item} />
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Histórico de movimentações */}
                <div className="lg:col-span-1">
                    {!selected ? (
                        <Card className="h-full flex items-center justify-center">
                            <CardContent className="text-center text-muted-foreground py-12">
                                <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Selecione um item</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Histórico: {selected.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                                {selected.transactions.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">Sem movimentações</p>
                                ) : selected.transactions.map(tx => {
                                    const isIn = tx.type === "IN" || (tx.type === "ADJUST" && tx.quantity > 0)
                                    return (
                                        <div key={tx.id} className="flex items-center gap-2 p-2 rounded border text-xs">
                                            {isIn
                                                ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                : <TrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                            }
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium">
                                                    {tx.type === "IN" ? "Entrada" : tx.type === "OUT" ? "Saída" : "Ajuste"}
                                                    {": "}
                                                    <span className={isIn ? "text-emerald-600" : "text-red-500"}>
                                                        {tx.quantity > 0 ? "+" : ""}{tx.quantity} {selected.unit}
                                                    </span>
                                                </p>
                                                {tx.notes && <p className="text-muted-foreground truncate">{tx.notes}</p>}
                                                <p className="text-muted-foreground">
                                                    {format(new Date(tx.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
