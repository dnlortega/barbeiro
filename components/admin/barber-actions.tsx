"use client"

import * as React from "react"
import { Edit, Trash2, Clock, Scissors, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { deleteBarber, updateBarber } from "@/app/actions/barbers"
import { AlertPopover } from "@/components/ui/alert-popover"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

export function BarberActions({ barber, allServices }: { barber: any, allServices: any[] }) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    // Form state
    const [name, setName] = React.useState(barber.name || "")
    const [email, setEmail] = React.useState(barber.email || "")
    const [startTime, setStartTime] = React.useState(barber.startTime || "09:00")
    const [endTime, setEndTime] = React.useState(barber.endTime || "19:00")
    const [selectedServices, setSelectedServices] = React.useState<string[]>(
        barber.services?.map((s: any) => s.id) || []
    )

    const handleDelete = async () => {
        const res = await deleteBarber(barber.id)
        if (res.success) {
            toast.success("Profissional removido com sucesso!")
        } else {
            toast.error(res.error || "Erro ao remover profissional")
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await updateBarber(barber.id, {
                name,
                email,
                startTime,
                endTime,
                serviceIds: selectedServices
            })
            if (res.success) {
                toast.success("Perfil atualizado com sucesso!")
                setOpen(false)
            } else {
                toast.error(res.error || "Erro ao atualizar perfil")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setLoading(false)
        }
    }

    const toggleService = (id: string) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    return (
        <div className="flex gap-2">
            <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
                <DialogPrimitive.Trigger asChild>
                    <Button size="icon" className="h-10 w-10 bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-primary rounded-2xl shadow-sm border border-slate-100 transition-all">
                        <Edit className="w-4 h-4" />
                    </Button>
                </DialogPrimitive.Trigger>
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
                    <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-2xl translate-x-[-50%] translate-y-[-50%] bg-white p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 focus:outline-none overflow-y-auto max-h-[90vh]">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <DialogPrimitive.Title className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                                    Editar <span className="text-primary italic">Profissional</span>
                                </DialogPrimitive.Title>
                                <DialogPrimitive.Description className="text-sm font-medium text-slate-400 italic">
                                    Atualize os horários e serviços realizados por {barber.name}.
                                </DialogPrimitive.Description>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Infos Básicas */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Informações de Perfil</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nome</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full h-14 px-6 font-bold rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">E-mail</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full h-14 px-6 font-bold rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary pt-4">Jornada de Trabalho</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Entrada</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    className="w-full h-14 px-6 font-bold rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Saída</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="w-full h-14 px-6 font-bold rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Serviços */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Serviços que realiza</h4>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {allServices.map(service => (
                                                <div
                                                    key={service.id}
                                                    onClick={() => toggleService(service.id)}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                                                        selectedServices.includes(service.id) ? "border-primary bg-primary/5" : "border-slate-50 bg-slate-50 hover:border-primary/20"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                            selectedServices.includes(service.id) ? "bg-primary text-white" : "bg-white text-slate-300 group-hover:text-primary"
                                                        )}>
                                                            <Scissors className="w-4 h-4" />
                                                        </div>
                                                        <p className="text-xs font-black uppercase tracking-tighter text-slate-900">{service.name}</p>
                                                    </div>
                                                    {selectedServices.includes(service.id) && (
                                                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-10 border-t border-slate-100 justify-end">
                                    <DialogPrimitive.Close asChild>
                                        <Button type="button" variant="ghost" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-slate-400">Cancelar</Button>
                                    </DialogPrimitive.Close>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="rounded-full h-14 px-10 font-black uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/20 font-black animate-in fade-in zoom-in"
                                    >
                                        {loading ? "Salvando..." : "Salvar Alterações"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                        <DialogPrimitive.Close className="absolute right-8 top-8 rounded-full p-2 text-slate-300 hover:text-slate-900 transition-colors">
                            <Trash2 className="w-6 h-6 rotate-45" />
                        </DialogPrimitive.Close>
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>

            <AlertPopover
                title="Remover Profissional?"
                description="Isso excluirá o acesso do barbeiro ao sistema. Ações irreversíveis."
                variant="danger"
                onConfirm={handleDelete}
                confirmText="Remover"
                trigger={
                    <Button size="icon" className="h-10 w-10 bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-red-500 rounded-2xl shadow-sm border border-slate-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                }
            />
        </div>
    )
}
