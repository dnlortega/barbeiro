export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getPackages, getClientPackages } from "@/app/actions/packages"
import { Package, Users, Scissors, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreatePackageDialog } from "@/components/admin/create-package-dialog"
import { SellPackageDialog } from "@/components/admin/sell-package-dialog"
import { UseSessionDialog } from "@/components/admin/use-session-dialog"
import { DeletePackageButton } from "@/components/admin/delete-package-button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default async function PackagesPage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""

    const [packages, clientPackages, services] = await Promise.all([
        getPackages(),
        getClientPackages(),
        prisma.service.findMany({ where: { salonId, isCombo: false }, orderBy: { name: "asc" } }),
    ])

    const activeClients = clientPackages.filter(cp => {
        const totalLeft = cp.package.items.reduce((acc, item) => {
            const used = cp.usages.filter(u => u.service.id === item.service.id).length
            return acc + (item.quantity - used)
        }, 0)
        return totalLeft > 0
    })

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pacotes de Sessões</h1>
                    <p className="text-muted-foreground text-sm">
                        Venda pacotes pré-pagos e acompanhe o saldo de cada cliente.
                    </p>
                </div>
                <CreatePackageDialog services={services} />
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { icon: Package, label: "Pacotes ativos", value: packages.filter(p => p.isActive).length },
                    { icon: Users, label: "Clientes com pacote", value: clientPackages.length },
                    { icon: CheckCircle, label: "Com sessões restantes", value: activeClients.length },
                ].map(({ icon: Icon, label, value }) => (
                    <Card key={label}>
                        <CardContent className="pt-4 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="text-2xl font-bold leading-none mt-0.5">{value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="catalog">
                <TabsList>
                    <TabsTrigger value="catalog">
                        <Package className="w-3.5 h-3.5 mr-1.5" /> Catálogo
                    </TabsTrigger>
                    <TabsTrigger value="clients">
                        <Users className="w-3.5 h-3.5 mr-1.5" /> Clientes
                        {activeClients.length > 0 && (
                            <Badge className="ml-1.5 h-4 min-w-4 px-1 text-[9px] bg-primary">{activeClients.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ── Catálogo de pacotes ── */}
                <TabsContent value="catalog" className="mt-4">
                    {packages.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Nenhum pacote criado ainda.</p>
                                <p className="text-xs mt-1">Crie um pacote como "5 cortes + 1 barba" e comece a vender.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {packages.map(pkg => (
                                <Card key={pkg.id} className={cn(!pkg.isActive && "opacity-60")}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Package className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                                                    {!pkg.isActive && <Badge variant="secondary" className="text-[10px] mt-0.5">Inativo</Badge>}
                                                </div>
                                            </div>
                                            <DeletePackageButton packageId={pkg.id} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0">
                                        <div className="space-y-1.5">
                                            {pkg.items.map(item => (
                                                <div key={item.id} className="flex items-center gap-2 text-sm">
                                                    <Scissors className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                    <span className="flex-1 truncate">{item.service.name}</span>
                                                    <Badge variant="outline" className="text-[11px] shrink-0">{item.quantity}x</Badge>
                                                </div>
                                            ))}
                                        </div>
                                        {pkg.description && (
                                            <p className="text-xs text-muted-foreground">{pkg.description}</p>
                                        )}
                                        <div className="flex items-center justify-between pt-1 border-t">
                                            <div>
                                                <span className="text-lg font-bold text-primary">R$ {pkg.price.toFixed(0)}</span>
                                                <span className="text-xs text-muted-foreground ml-2">{pkg._count.purchases} venda{pkg._count.purchases !== 1 ? "s" : ""}</span>
                                            </div>
                                            {pkg.isActive && <SellPackageDialog pkg={pkg} />}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ── Clientes com pacote ── */}
                <TabsContent value="clients" className="mt-4">
                    {clientPackages.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Nenhum pacote vendido ainda.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {clientPackages.map(cp => {
                                const remaining = cp.package.items.map(item => {
                                    const used = cp.usages.filter(u => u.service.id === item.service.id).length
                                    return { ...item, used, left: item.quantity - used }
                                })
                                const totalLeft = remaining.reduce((acc, r) => acc + r.left, 0)
                                const totalSessions = cp.package.items.reduce((acc, i) => acc + i.quantity, 0)
                                const pct = totalSessions > 0 ? ((totalLeft / totalSessions) * 100) : 0
                                const isExpired = cp.expiresAt && new Date(cp.expiresAt) < new Date()

                                return (
                                    <Card key={cp.id} className={cn(totalLeft === 0 && "opacity-60")}>
                                        <CardContent className="pt-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold">{cp.customerName}</p>
                                                    <p className="text-xs text-muted-foreground">{cp.customerPhone}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    {totalLeft === 0
                                                        ? <Badge variant="secondary" className="text-[10px]">Esgotado</Badge>
                                                        : isExpired
                                                            ? <Badge className="bg-red-100 text-red-600 text-[10px]">Expirado</Badge>
                                                            : <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{totalLeft} sessão{totalLeft !== 1 ? "ões" : ""}</Badge>
                                                    }
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">{cp.package.name}</p>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all"
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                                                    <span>{totalLeft} restante{totalLeft !== 1 ? "s" : ""}</span>
                                                    <span>{totalSessions - totalLeft} usado{totalSessions - totalLeft !== 1 ? "s" : ""}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                {remaining.map(r => (
                                                    <div key={r.service.id} className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground truncate mr-2">{r.service.name}</span>
                                                        <span className={cn("font-medium shrink-0", r.left === 0 && "text-muted-foreground line-through")}>
                                                            {r.left}/{r.quantity}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-1 border-t">
                                                <p className="text-[11px] text-muted-foreground">
                                                    {format(new Date(cp.purchasedAt), "dd/MM/yyyy", { locale: ptBR })}
                                                    {cp.expiresAt && ` · até ${format(new Date(cp.expiresAt), "dd/MM/yyyy", { locale: ptBR })}`}
                                                </p>
                                                <UseSessionDialog
                                                    clientPackageId={cp.id}
                                                    customerName={cp.customerName}
                                                    items={cp.package.items}
                                                    usages={cp.usages}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
