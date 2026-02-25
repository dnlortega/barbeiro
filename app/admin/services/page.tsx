import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Scissors, Shield, LayoutDashboard, Settings, User, LogOut, Menu, Calendar as CalendarIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { signOut } from "@/lib/auth"
import { ServiceActions } from "@/components/admin/service-actions"

export default async function AdminServicesPage() {
    const session = await auth()

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/login")
    }

    const services = await prisma.service.findMany({
        orderBy: {
            price: 'asc'
        }
    })

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Agendamentos", href: "/admin/appointments", icon: CalendarIcon },
        { name: "Serviços", href: "/admin/services", icon: Scissors, active: true },
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

            <main className="flex-grow md:ml-72 p-6 md:p-12 max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">Catálogo de <span className="text-primary italic">Serviços</span></h2>
                        <p className="text-slate-500 font-medium italic">Gerencie os serviços e preços oferecidos pela barbearia.</p>
                    </div>
                    <Button className="rounded-full h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary text-white">
                        <Plus className="w-5 h-5 mr-2" /> Novo Serviço
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.length > 0 ? services.map((service) => (
                        <div key={service.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group hover:border-primary/20 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                    <Scissors className="w-7 h-7" />
                                </div>
                                <ServiceActions serviceId={service.id} />
                            </div>

                            <div className="flex-grow space-y-2">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{service.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{service.duration} MIN</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-3xl font-black tracking-tighter italic text-primary">R$ {service.price.toFixed(0)}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-white border border-slate-200 rounded-[2.5rem]">
                            <Scissors className="w-16 h-16 mx-auto mb-4 text-slate-100" />
                            <p className="text-slate-400 font-black uppercase tracking-widest">Nenhum serviço cadastrado.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
