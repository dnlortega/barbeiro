"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Scissors, Clock, User, Calendar, MessageCircle, CheckCircle2 } from "lucide-react"
import { getBarberAppointments, updateAppointmentStatus } from "@/app/actions/appointments"
import { getSettings } from "@/app/actions/settings"
import { format, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

export default function BarberPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [appointments, setAppointments] = useState<any[]>([])
    const [settings, setSettings] = useState<any>(null)
    const [loadingData, setLoadingData] = useState(true)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    const fetchData = async () => {
        if (session?.user?.id) {
            try {
                const [apps, sett] = await Promise.all([
                    getBarberAppointments((session.user as any).id, selectedDate),
                    getSettings()
                ])
                setAppointments(apps)
                setSettings(sett)
            } catch (error) {
                console.error("Error fetching barber data:", error)
                toast.error("Erro ao carregar dados da agenda.")
            } finally {
                setLoadingData(false)
            }
        }
    }

    useEffect(() => {
        setLoadingData(true)
        fetchData()
    }, [session, selectedDate])

    const sendWhatsAppNext = (appointment: any) => {
        if (!appointment.customerPhone) {
            toast.error("Cliente não possui telefone cadastrado.")
            return
        }

        const phone = appointment.customerPhone.replace(/\D/g, '')
        const shopName = settings?.barberShopName || "Barbearia"
        const message = `Olá ${appointment.customerName || 'Cliente'}! Aqui é o ${session?.user?.name || 'seu barbeiro'} da ${shopName}. Você é o PRÓXIMO da vez! Pode vir para a barbearia agora. ✂️`

        const url = `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const res = await updateAppointmentStatus(id, newStatus)
            if (res.success) {
                toast.success(`Status atualizado para ${newStatus}`)
                fetchData()
            }
        } catch (error) {
            toast.error("Erro ao atualizar status.")
        }
    }

    if (status === "loading" || loadingData) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    )

    if (!session) return null

    const activeApps = appointments.filter(app => {
        const d = new Date(app.date)
        return d.toDateString() === selectedDate.toDateString()
    })

    const nextClient = activeApps.find(app => app.status === 'PENDING' || app.status === 'CONFIRMED')

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pro-layout">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Scissors className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-black text-xl tracking-tighter uppercase leading-none">Painel <span className="text-primary italic">Pro</span></h1>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{session.user?.name}</p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl h-12 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sair do Painel</span>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-6 md:p-12 max-w-5xl space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Minha <span className="text-primary italic">Agenda</span></h2>
                        <p className="text-slate-500 font-medium italic">
                            {isToday(selectedDate) ? "Atendimentos de hoje" : "Atendimentos para"} , {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-white hover:border-primary transition-all">
                                <Calendar className="w-4 h-4 text-primary" />
                                {format(selectedDate, "dd/MM/yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-2 border-slate-100" align="end">
                            <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                initialFocus
                                locale={ptBR}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Próximos de Hoje
                        </h3>

                        {activeApps.length > 0 ? activeApps.map((app) => (
                            <div key={app.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-6 w-full">
                                    <div className="text-center min-w-[60px]">
                                        <p className="text-2xl font-black tracking-tighter leading-none">{format(new Date(app.date), "HH:mm")}</p>
                                        <div className={cn(
                                            "w-4 h-1 mx-auto mt-1 rounded-full",
                                            app.status === 'CONFIRMED' ? "bg-emerald-500" :
                                                app.status === 'PENDING' ? "bg-amber-500" : "bg-slate-200"
                                        )}></div>
                                    </div>
                                    <div className="space-y-1 overflow-hidden">
                                        <p className="font-black uppercase tracking-tighter text-lg truncate">{app.customerName || "Anônimo"}</p>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Scissors className="w-3 h-3" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest truncate">{app.service.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto">
                                    <Button
                                        onClick={() => sendWhatsAppNext(app)}
                                        variant="outline"
                                        className="h-12 px-6 rounded-2xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" /> Avisar Próximo
                                    </Button>
                                    <Button
                                        onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
                                        className="h-12 px-6 rounded-2xl bg-primary text-white shadow-lg shadow-primary/10 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Concluir
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
                                <Clock className="w-12 h-12 mx-auto mb-4 text-slate-100" />
                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
                                    {isToday(selectedDate) ? "Nenhum agendamento para hoje." : "Nenhum agendamento para esta data."}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Blitz Geral
                        </h3>
                        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximo na Cadeira</p>
                                {nextClient ? (
                                    <>
                                        <p className="text-2xl font-black tracking-tighter uppercase italic leading-tight">{nextClient.customerName}</p>
                                        <p className="text-[10px] font-bold text-primary uppercase">{format(new Date(nextClient.date), "HH:mm")} - {nextClient.service.name}</p>
                                    </>
                                ) : (
                                    <p className="text-xl font-black text-slate-200 uppercase italic">Livre</p>
                                )}
                            </div>
                            <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Agendados</p>
                                    <p className="text-2xl font-black text-primary">{activeApps.length}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Concluídos</p>
                                    <p className="text-2xl font-black text-emerald-500">{activeApps.filter(a => a.status === 'COMPLETED').length}</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-bold uppercase text-[10px] tracking-widest text-slate-600 hover:bg-slate-50">Abrir Relatório</Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
