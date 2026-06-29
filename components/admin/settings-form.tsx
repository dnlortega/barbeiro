"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { updateSettings } from "@/app/actions/settings"
import { cn } from "@/lib/utils"

export function SettingsForm({ settings }: { settings: any }) {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: settings?.name || "",
        whatsapp: settings?.whatsapp || "",
        address: settings?.address || "",
        darkMode: settings?.darkMode ?? true,
    })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await updateSettings({ ...form, barberShopName: form.name })
            if (res.success) toast.success("Configurações salvas!")
            else toast.error(res.error || "Erro ao salvar")
        } catch { toast.error("Erro inesperado") }
        finally { setLoading(false) }
    }

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Informações Gerais</CardTitle>
                    <CardDescription>Dados públicos da barbearia exibidos para clientes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="shopName">Nome da Barbearia</Label>
                            <Input id="shopName" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp de Contato</Label>
                            <Input id="whatsapp" required placeholder="(11) 99999-9999" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Endereço Completo</Label>
                            <Input id="address" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Preferências</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div
                        onClick={() => setForm({ ...form, darkMode: !form.darkMode })}
                        className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                        <div>
                            <p className="text-sm font-medium">Modo Escuro</p>
                            <p className="text-xs text-muted-foreground">Ativado por padrão para novos usuários</p>
                        </div>
                        <div className={cn("w-10 h-5 rounded-full relative transition-colors shrink-0", form.darkMode ? "bg-primary" : "bg-muted")}>
                            <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all", form.darkMode ? "right-0.5" : "left-0.5")} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md border opacity-50 cursor-not-allowed">
                        <div>
                            <p className="text-sm font-medium">Notificações por E-mail</p>
                            <p className="text-xs text-muted-foreground">Em breve</p>
                        </div>
                        <div className="w-10 h-5 rounded-full relative bg-muted shrink-0">
                            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="gap-2">
                    <Save className="w-4 h-4" />
                    {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    )
}
