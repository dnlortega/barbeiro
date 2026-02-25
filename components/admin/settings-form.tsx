"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { updateSettings } from "@/app/actions/settings"

export function SettingsForm({ settings }: { settings: any }) {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        barberShopName: settings?.barberShopName || "",
        whatsapp: settings?.whatsapp || "",
        address: settings?.address || "",
        darkMode: settings?.darkMode ?? true
    })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await updateSettings(form)
            if (res.success) {
                toast.success("Configurações salvas com sucesso!")
            } else {
                toast.error(res.error || "Erro ao salvar")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 border-b pb-4">Informações Gerais</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome da Barbearia</label>
                            <input
                                type="text"
                                required
                                value={form.barberShopName}
                                onChange={(e) => setForm({ ...form, barberShopName: e.target.value })}
                                className="w-full h-14 px-6 font-bold rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp de Contato</label>
                            <input
                                type="text"
                                required
                                value={form.whatsapp}
                                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                                className="w-full h-14 px-6 font-bold rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Endereço Completo</label>
                            <input
                                type="text"
                                required
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full h-14 px-6 font-bold rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 border-b pb-4">Preferências Estéticas</h3>
                    <div className="space-y-4">
                        <div
                            onClick={() => setForm({ ...form, darkMode: !form.darkMode })}
                            className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer"
                        >
                            <div>
                                <p className="font-black uppercase tracking-tighter text-slate-900">Modo Escuro</p>
                                <p className="text-[10px] font-bold text-slate-400">Ativado por padrão para novos usuários</p>
                            </div>
                            <div className={cn(
                                "w-12 h-6 rounded-full relative transition-colors",
                                form.darkMode ? "bg-primary" : "bg-slate-300"
                            )}>
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                                    form.darkMode ? "right-1" : "left-1"
                                )} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent hover:border-primary/20 transition-all opacity-50 cursor-not-allowed">
                            <div>
                                <p className="font-black uppercase tracking-tighter text-slate-900">Notificações por Email</p>
                                <p className="text-[10px] font-bold text-slate-400">Em breve</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 flex justify-end">
                <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-full h-16 px-10 gap-3 font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary text-white"
                >
                    <Save className="w-5 h-5" /> {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
