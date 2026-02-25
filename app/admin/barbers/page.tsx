import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { User, Shield, LayoutDashboard, Settings, Scissors, LogOut, Menu, Calendar as CalendarIcon, Plus, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { signOut } from "@/lib/auth"
import { BarberActions } from "@/components/admin/barber-actions"

export default async function AdminBarbersPage() {
    const session = await auth()

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/login")
    }

    const barbers = await prisma.user.findMany({
        where: {
            role: "BARBER"
        },
        include: {
            services: true
        },
        orderBy: {
            name: 'asc'
        }
    })

    const allServices = await prisma.service.findMany({
        orderBy: { name: 'asc' }
    })

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Agendamentos", href: "/admin/appointments", icon: CalendarIcon },
        { name: "Serviços", href: "/admin/services", icon: Scissors },
        { name: "Profissionais", href: "/admin/barbers", icon: User, active: true },
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

            <main className="flex-grow md:ml-72 p-6 md:p-12 max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">Time de <span className="text-primary italic">Especialistas</span></h2>
                        <p className="text-slate-500 font-medium italic">Gerencie sua equipe de barbeiros e seus horários.</p>
                    </div>
                    <Button className="rounded-full h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary text-white">
                        <Plus className="w-5 h-5 mr-2" /> Novo Profissional
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {barbers.length > 0 ? barbers.map((barber) => (
                        <div key={barber.id} className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm group hover:border-primary/20 transition-all flex flex-col">
                            <div className="aspect-[4/3] bg-slate-100 relative">
                                {barber.image ? (
                                    <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300 font-black text-6xl italic">
                                        {barber.name.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <BarberActions
                                        barber={barber}
                                        allServices={allServices}
                                    />
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{barber.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Mail className="w-3.5 h-3.5" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">{barber.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {barber.services.map(s => (
                                            <span key={s.id} className="text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary px-2 py-1 rounded-lg border border-primary/10">
                                                {s.name}
                                            </span>
                                        ))}
                                        {barber.services.length === 0 && (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-1 rounded-lg">
                                                Sem serviços vinculados
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-primary" />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jornada</p>
                                        </div>
                                        <p className="text-sm font-black italic text-slate-900">{barber.startTime || '--:--'} - {barber.endTime || '--:--'}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] font-black uppercase tracking-tighter text-emerald-600">Ativo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-white border border-slate-200 rounded-[3rem]">
                            <User className="w-16 h-16 mx-auto mb-4 text-slate-100" />
                            <p className="text-slate-400 font-black uppercase tracking-widest">Nenhum profissional no time.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
