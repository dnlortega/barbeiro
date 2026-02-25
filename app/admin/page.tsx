import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Scissors, Clock, DollarSign, Plus, LogOut, User, Calendar as CalendarIcon, Shield, LayoutDashboard, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { AppointmentActions } from "@/components/admin/appointment-actions"

export const metadata: Metadata = {
    title: "Admin - Barbearia Premium",
    description: "Sistema de gerenciamento interno",
}

export default async function AdminPage() {
    const session = await auth()

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/login")
    }

    // Buscar todos os serviços
    const services = await prisma.service.findMany({
        orderBy: { price: 'asc' }
    })

    // Buscar agendamentos (todos para estatísticas, mas recentes para a tabela)
    const allAppointments = await prisma.appointment.findMany({
        include: { service: true, barber: true },
        orderBy: { date: 'desc' }
    })

    const recentAppointments = allAppointments.slice(0, 8)

    const totalAppointments = allAppointments.length
    const todayAppointments = allAppointments.filter(app => {
        const today = new Date()
        const appDate = new Date(app.date)
        return appDate.getDate() === today.getDate() &&
            appDate.getMonth() === today.getMonth() &&
            appDate.getFullYear() === today.getFullYear()
    }).length

    const estimatedRevenue = allAppointments
        .filter(app => app.status === 'CONFIRMED' || app.status === 'PENDING')
        .reduce((acc, app) => acc + app.service.price, 0)

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard, active: true },
        { name: "Agendamentos", href: "/admin/appointments", icon: CalendarIcon },
        { name: "Serviços", href: "/admin/services", icon: Scissors },
        { name: "Profissionais", href: "/admin/barbers", icon: User },
        { name: "Configurações", href: "/admin/settings", icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 admin-layout">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col p-8 space-y-10 fixed h-full z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap text-slate-900">
                        Barbearia <span className="text-primary italic">CMS</span>
                    </span>
                </div>

                <nav className="flex-grow space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300",
                                item.active
                                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <item.icon className="w-5 h-5" /> {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="pt-10 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-primary">
                            {session.user?.name?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black truncate text-slate-900">{session.user?.name}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Administrador</p>
                        </div>
                    </div>
                    <form action={async () => {
                        'use server'
                        await signOut()
                    }}>
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-50 rounded-2xl h-12">
                            <LogOut className="w-4 h-4 mr-2" /> Encerrar Sessão
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-tighter text-slate-900">Barbearia CMS</span>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-900"><Menu /></Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-8 flex flex-col bg-white">
                        <SheetTitle className="mb-8 text-slate-900 font-black">Menu Administrativo</SheetTitle>
                        <nav className="space-y-4 flex-grow">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-colors",
                                        item.active ? "text-primary" : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" /> {item.name}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </header>

            {/* Content Area */}
            <main className="flex-grow md:ml-72 bg-slate-50">
                <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-1">
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">Balanço do <span className="text-primary italic">Dia</span></h2>
                            <p className="text-slate-500 font-medium italic">Controle total das operações do dia {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</p>
                        </div>
                        <Button className="rounded-full h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary text-white">
                            <Plus className="w-5 h-5 mr-2" /> Novo Registro
                        </Button>
                    </div>

                    {/* Stats Horizontal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CardStat title="Agendas Hoje" value={todayAppointments} icon={Clock} trend={todayAppointments > 0 ? "+1" : "0"} />
                        <CardStat title="Serviços Ativos" value={services.length} icon={Scissors} />
                        <CardStat title="Total Agendas" value={totalAppointments} icon={CalendarIcon} />
                        <CardStat title="Receita Prevista" value={`R$ ${estimatedRevenue.toFixed(0)}`} icon={DollarSign} color="text-emerald-600" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                        {/* Table Area */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800">Agendas Recentes</h3>
                                <Link href="/admin/appointments" className="text-xs font-black uppercase text-primary hover:underline underline-offset-4 tracking-widest">Ver Tudo</Link>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden text-slate-900">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cliente / Contato</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Serviço Escolhido</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Data & Horário</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {recentAppointments.length > 0 ? recentAppointments.map((app) => (
                                                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                app.status === 'CONFIRMED' ? "bg-emerald-500" :
                                                                    app.status === 'PENDING' ? "bg-amber-500" : "bg-red-500"
                                                            )} />
                                                            <p className="font-black uppercase tracking-tighter text-sm text-slate-900">{app.customerName || "Anônimo"}</p>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 italic">{app.customerPhone || "Sem contato"}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                                                <Scissors className="w-4 h-4" />
                                                            </div>
                                                            <p className="font-bold text-xs uppercase tracking-widest text-slate-700">{app.service.name}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <p className="font-black text-xs uppercase tracking-widest text-slate-900">{format(new Date(app.date), "dd/MM")}</p>
                                                        <p className="text-[10px] font-bold text-primary italic">{format(new Date(app.date), "HH:mm")}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <AppointmentActions
                                                            appointmentId={app.id}
                                                            phone={app.customerPhone}
                                                            name={app.customerName}
                                                        />
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-300">
                                                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                        <p className="text-sm font-bold uppercase tracking-widest">Nenhum registro hoje</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Quick View Services */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800">Serviços Pro</h3>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-4 shadow-sm">
                                {services.slice(0, 5).map(service => (
                                    <div key={service.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                <Scissors className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-black uppercase tracking-tighter text-sm text-slate-900">{service.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 italic uppercase">{service.duration} MIN</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-primary tracking-tighter">R$ {service.price.toFixed(0)}</p>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full rounded-2xl h-12 uppercase font-black text-[10px] tracking-[0.2em] border-slate-200 text-slate-600 hover:bg-slate-50">Gerenciar Catálogo</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function CardStat({ title, value, icon: Icon, trend, color = "text-slate-400" }: any) {
    return (
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] space-y-5 shadow-sm group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{trend}</span>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <p className="text-4xl font-black tracking-tighter italic text-slate-900">{value}</p>
            </div>
        </div>
    )
}
