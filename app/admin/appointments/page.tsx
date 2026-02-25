import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Scissors, Calendar as CalendarIcon, Shield, LayoutDashboard, Settings, User, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AppointmentActions } from "@/components/admin/appointment-actions"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { signOut } from "@/lib/auth"

export default async function AdminAppointmentsPage() {
    const session = await auth()

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/login")
    }

    const appointments = await prisma.appointment.findMany({
        include: {
            service: true,
            barber: true
        },
        orderBy: {
            date: 'desc'
        }
    })

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Agendamentos", href: "/admin/appointments", icon: CalendarIcon, active: true },
        { name: "Serviços", href: "/admin/services", icon: Scissors },
        { name: "Profissionais", href: "/admin/barbers", icon: User },
        { name: "Configurações", href: "/admin/settings", icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 admin-layout">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 bg-white border-r flex-col p-8 space-y-10 fixed h-full z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap">
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
                        <SheetTitle className="mb-8 text-slate-900">Menu Administrativo</SheetTitle>
                        <nav className="space-y-4 flex-grow">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3 rounded-xl font-bold",
                                        item.active ? "text-primary" : "text-slate-500"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" /> {item.name}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </header>

            <main className="flex-grow md:ml-72 p-6 md:p-12 max-w-7xl mx-auto space-y-12">
                <div className="space-y-1">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">Todos os <span className="text-primary italic">Agendamentos</span></h2>
                    <p className="text-slate-500 font-medium italic">Lista completa de clientes e horários reservados.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden text-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-900">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cliente</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Serviço</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profissional</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Data & Horário</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {appointments.length > 0 ? appointments.map((app) => (
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
                                            <p className="font-bold text-xs uppercase tracking-widest text-slate-700">{app.service.name}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-xs uppercase tracking-widest text-slate-700">{app.barber.name}</p>
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
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Nenhum agendamento encontrado</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
