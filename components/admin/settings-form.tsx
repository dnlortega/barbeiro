"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Save, Eye, EyeOff, Lock } from "lucide-react"
import { toast } from "sonner"
import { updateSettings } from "@/app/actions/settings"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
    "#18181b", "#dc2626", "#ea580c", "#d97706", "#16a34a",
    "#0891b2", "#2563eb", "#7c3aed", "#db2777", "#64748b",
]

type Settings = {
    name: string | null
    whatsapp: string | null
    address: string | null
    darkMode: boolean
    primaryColor: string | null
    autoConfirmHours: number | null
}

export function SettingsForm({ settings }: { settings: Settings | null }) {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: settings?.name || "",
        whatsapp: settings?.whatsapp || "",
        address: settings?.address || "",
        darkMode: settings?.darkMode ?? true,
        primaryColor: settings?.primaryColor || "",
        autoConfirmHours: settings?.autoConfirmHours?.toString() || "",
    })
    const [isDirty, setIsDirty] = useState(false)

    const update = (field: keyof typeof form, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim()) { toast.error("Nome da barbearia é obrigatório"); return }
        setLoading(true)
        try {
            const res = await updateSettings({
                name: form.name, whatsapp: form.whatsapp, address: form.address, darkMode: form.darkMode,
                primaryColor: form.primaryColor || undefined,
                autoConfirmHours: form.autoConfirmHours ? parseInt(form.autoConfirmHours) : null,
            })
            if (res.success) { toast.success("Configurações salvas!"); setIsDirty(false) }
            else toast.error(res.error || "Erro ao salvar")
        } catch { toast.error("Erro inesperado") }
        finally { setLoading(false) }
    }

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Informações Gerais</CardTitle>
                    <CardDescription>Dados públicos exibidos para clientes no site e agendamento.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="shopName">Nome da Barbearia <span className="text-destructive">*</span></Label>
                            <Input
                                id="shopName" required
                                value={form.name}
                                onChange={e => update("name", e.target.value)}
                                placeholder="Ex: Barbearia Imperial"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp de Contato</Label>
                            <Input
                                id="whatsapp"
                                placeholder="(11) 99999-9999"
                                value={form.whatsapp}
                                onChange={e => update("whatsapp", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Endereço Completo</Label>
                            <Input
                                id="address"
                                placeholder="Rua das Flores, 123 — Bairro Centro, Cidade - SP"
                                value={form.address}
                                onChange={e => update("address", e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Aparência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div
                        onClick={() => update("darkMode", !form.darkMode)}
                        className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    >
                        <div>
                            <p className="text-sm font-medium">Modo Escuro</p>
                            <p className="text-xs text-muted-foreground">Tema padrão do painel administrativo</p>
                        </div>
                        <div className={cn("w-10 h-5 rounded-full relative transition-colors shrink-0", form.darkMode ? "bg-primary" : "bg-muted border")}>
                            <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200", form.darkMode ? "right-0.5" : "left-0.5")} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm">Cor principal da página de agendamento</Label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => update("primaryColor", c)}
                                    className={cn(
                                        "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                                        form.primaryColor === c ? "border-foreground scale-110" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                            <input
                                type="color"
                                value={form.primaryColor || "#18181b"}
                                onChange={e => update("primaryColor", e.target.value)}
                                className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                                title="Cor personalizada"
                            />
                        </div>
                        {form.primaryColor && (
                            <p className="text-xs text-muted-foreground">Cor selecionada: {form.primaryColor}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Automações</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label>Confirmação automática</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                min="1"
                                max="72"
                                className="w-24"
                                placeholder="—"
                                value={form.autoConfirmHours}
                                onChange={e => update("autoConfirmHours", e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">horas antes de confirmar automaticamente</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Agendamentos pendentes serão confirmados automaticamente X horas antes. Deixe vazio para desativar.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
                {isDirty && <p className="text-xs text-muted-foreground">Há alterações não salvas</p>}
                <Button type="submit" disabled={loading || !isDirty} className="gap-2">
                    <Save className="w-4 h-4" />
                    {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    )
}

export function PasswordForm() {
    const [loading, setLoading] = useState(false)
    const [current, setCurrent] = useState("")
    const [next, setNext] = useState("")
    const [confirm, setConfirm] = useState("")
    const [show, setShow] = useState(false)

    const handleChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (next.length < 6) { toast.error("Nova senha deve ter pelo menos 6 caracteres"); return }
        if (next !== confirm) { toast.error("As senhas não coincidem"); return }
        setLoading(true)
        try {
            const { changePassword } = await import("@/app/actions/settings")
            const res = await changePassword(current, next)
            if (res.success) {
                toast.success("Senha alterada com sucesso!")
                setCurrent(""); setNext(""); setConfirm("")
            } else {
                toast.error(res.error || "Erro ao alterar senha")
            }
        } catch { toast.error("Erro inesperado") }
        finally { setLoading(false) }
    }

    return (
        <form onSubmit={handleChange}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Segurança
                    </CardTitle>
                    <CardDescription>Altere a senha de acesso ao painel do seu salão.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Senha atual</Label>
                        <div className="relative">
                            <Input
                                type={show ? "text" : "password"}
                                value={current}
                                onChange={e => setCurrent(e.target.value)}
                                placeholder="••••••••"
                                className="pr-10"
                            />
                            <button type="button" onClick={() => setShow(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nova senha</Label>
                            <Input
                                type={show ? "text" : "password"}
                                value={next}
                                onChange={e => setNext(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirmar nova senha</Label>
                            <Input
                                type={show ? "text" : "password"}
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder="Repita a nova senha"
                                className={cn(confirm && next !== confirm && "border-destructive focus-visible:ring-destructive")}
                            />
                            {confirm && next !== confirm && (
                                <p className="text-xs text-destructive">As senhas não coincidem</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading || !current || !next || next !== confirm} variant="outline" className="gap-2">
                            <Lock className="w-4 h-4" />
                            {loading ? "Alterando..." : "Alterar Senha"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
