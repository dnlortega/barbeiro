"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Scissors, CalendarDays, Shield, LayoutDashboard, Settings, Users, LogOut, Menu, ListOrdered, Store, Package, Clock, UserSearch, BarChart2, ClipboardList, ShieldX, Boxes, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const baseNavItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, adminOnly: false },
    { name: "Agendamentos", href: "/admin/appointments", icon: CalendarDays, adminOnly: false },
    { name: "Timeline", href: "/admin/timeline", icon: Clock, adminOnly: false },
    { name: "Fila de Espera", href: "/admin/waitlist", icon: ListOrdered, badgeKey: "waiting", adminOnly: false },
    { name: "Serviços", href: "/admin/services", icon: Scissors, adminOnly: false },
    { name: "Pacotes", href: "/admin/packages", icon: Package, adminOnly: false },
    { name: "Profissionais", href: "/admin/barbers", icon: Users, adminOnly: false },
    { name: "Clientes", href: "/admin/clients", icon: UserSearch, adminOnly: false },
    { name: "Relatórios", href: "/admin/report", icon: BarChart2, adminOnly: false },
    { name: "Comanda", href: "/admin/comanda", icon: ClipboardList, adminOnly: false },
    { name: "Comissões", href: "/admin/commissions", icon: Percent, adminOnly: false },
    { name: "Estoque", href: "/admin/stock", icon: Boxes, adminOnly: false },
    { name: "Lista Negra", href: "/admin/blacklist", icon: ShieldX, adminOnly: false },
    { name: "Salões", href: "/admin/salons", icon: Store, adminOnly: true },
    { name: "Configurações", href: "/admin/settings", icon: Settings, adminOnly: false },
]

type Props = { userName: string; userEmail: string; waitingCount: number; isAdmin?: boolean }

export function AdminSidebar({ userName, userEmail, waitingCount, isAdmin = false }: Props) {
    const pathname = usePathname()
    const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
    const navItems = baseNavItems.filter(item => !item.adminOnly || isAdmin)

    return (
        <>
            {/* ── Desktop: sidebar icon-only ── */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 z-20 w-16 bg-background border-r flex-col items-center py-3 gap-1">
                {/* Logo */}
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center mb-4 shrink-0" title="Barbearia CMS">
                    <Shield className="w-5 h-5 text-primary-foreground" />
                </div>

                {/* Nav */}
                <nav className="flex flex-col items-center gap-0.5 flex-1 w-full px-2 overflow-y-auto">
                    {navItems.map(item => {
                        const active = isActive(item.href)
                        const badge = item.badgeKey === "waiting" ? waitingCount : 0
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={item.name}
                                className={cn(
                                    "relative w-full flex items-center justify-center h-9 rounded-md transition-colors",
                                    active
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {badge > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
                                        {badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User + logout */}
                <div className="flex flex-col items-center gap-2 pt-2 border-t w-full px-2">
                    <Avatar className="h-8 w-8 shrink-0" title={`${userName} — ${userEmail}`}>
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        title="Encerrar Sessão"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </aside>

            {/* ── Mobile: header + sheet ── */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b h-14 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                        <Shield className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-sm">Admin</span>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0 flex flex-col">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Menu Administrativo</SheetTitle>
                        </SheetHeader>
                        <div className="flex items-center gap-3 px-4 h-14 border-b shrink-0">
                            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
                                <Shield className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm leading-none">Barbearia CMS</p>
                                <p className="text-[11px] text-muted-foreground">Painel Administrativo</p>
                            </div>
                        </div>
                        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                            {navItems.map(item => {
                                const active = isActive(item.href)
                                const badge = item.badgeKey === "waiting" ? waitingCount : 0
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                            active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4 shrink-0" />
                                        <span className="flex-1">{item.name}</span>
                                        {badge > 0 && (
                                            <Badge variant={active ? "secondary" : "default"} className="text-[10px] h-5 min-w-5 px-1">
                                                {badge}
                                            </Badge>
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>
                        <div className="px-3 pb-4 pt-2 border-t space-y-1 shrink-0">
                            <div className="flex items-center gap-3 px-3 py-2">
                                <Avatar className="h-7 w-7 shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                        {userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium truncate leading-none">{userName}</p>
                                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{userEmail}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => signOut({ callbackUrl: "/" })}>
                                <LogOut className="w-4 h-4 mr-2" /> Encerrar Sessão
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </header>
        </>
    )
}
