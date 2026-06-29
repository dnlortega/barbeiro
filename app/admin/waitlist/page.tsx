export const dynamic = "force-dynamic"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllWaitList } from "@/app/actions/waitlist"
import { WaitListActions } from "@/components/admin/waitlist-actions"
import { AddWaitlistDialog } from "@/components/admin/add-waitlist-dialog"
import { cn } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    WAITING: { label: "Aguardando", cls: "bg-amber-100 text-amber-700" },
    NOTIFIED: { label: "Notificado", cls: "bg-blue-100 text-blue-700" },
    BOOKED: { label: "Agendado", cls: "bg-emerald-100 text-emerald-700" },
    CANCELLED: { label: "Cancelado", cls: "bg-slate-100 text-slate-500" },
}

export default async function WaitListPage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""

    const [entries, services, barbers] = await Promise.all([
        getAllWaitList(),
        prisma.service.findMany({ where: { salonId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.barber.findMany({ where: { salonId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ])

    const waiting = entries.filter(e => e.status === "WAITING").length

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Fila de Espera</h1>
                    <p className="text-muted-foreground text-sm">
                        {waiting > 0 ? `${waiting} cliente${waiting > 1 ? "s" : ""} aguardando vaga` : "Nenhum cliente na fila no momento"}
                    </p>
                </div>
                <AddWaitlistDialog services={services} barbers={barbers} salonId={salonId} />
            </div>

            {/* Tabela — desktop */}
            <Card className="py-0 hidden sm:block">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Profissional</TableHead>
                                <TableHead>Data preferida</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.length > 0 ? entries.map((entry, index) => {
                                const st = STATUS_MAP[entry.status] || STATUS_MAP.WAITING
                                return (
                                    <TableRow key={entry.id}>
                                        <TableCell className="text-muted-foreground font-medium">#{index + 1}</TableCell>
                                        <TableCell>
                                            <p className="font-medium text-sm">{entry.customerName}</p>
                                            <p className="text-xs text-muted-foreground">{entry.customerPhone}</p>
                                        </TableCell>
                                        <TableCell className="text-sm">{entry.service.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{entry.barber?.name || "Qualquer"}</TableCell>
                                        <TableCell>
                                            {entry.preferredDate ? (
                                                <p className="text-sm font-medium">{format(new Date(entry.preferredDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                                            ) : <span className="text-muted-foreground">—</span>}
                                            <p className="text-xs text-muted-foreground">Desde {format(new Date(entry.createdAt), "dd/MM HH:mm")}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("text-[11px]", st.cls)}>{st.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <WaitListActions
                                                entryId={entry.id}
                                                phone={entry.customerPhone}
                                                name={entry.customerName}
                                                service={entry.service.name}
                                                preferredDate={entry.preferredDate ? format(new Date(entry.preferredDate), "dd/MM", { locale: ptBR }) : null}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-16 text-center text-muted-foreground text-sm">
                                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        Fila vazia
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Cards — mobile */}
            <div className="sm:hidden space-y-2">
                {entries.length > 0 ? entries.map((entry, index) => {
                    const st = STATUS_MAP[entry.status] || STATUS_MAP.WAITING
                    return (
                        <Card key={entry.id} className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground font-medium">#{index + 1}</span>
                                        <p className="font-semibold text-sm truncate">{entry.customerName}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{entry.customerPhone}</p>
                                </div>
                                <Badge className={cn("text-[10px] shrink-0", st.cls)}>{st.label}</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>{entry.service.name}</span>
                                <span>{entry.barber?.name || "Qualquer profissional"}</span>
                                {entry.preferredDate && (
                                    <span className="font-medium text-foreground">
                                        {format(new Date(entry.preferredDate), "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 flex justify-end">
                                <WaitListActions
                                    entryId={entry.id}
                                    phone={entry.customerPhone}
                                    name={entry.customerName}
                                    service={entry.service.name}
                                    preferredDate={entry.preferredDate ? format(new Date(entry.preferredDate), "dd/MM", { locale: ptBR }) : null}
                                />
                            </div>
                        </Card>
                    )
                }) : (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        Fila vazia
                    </div>
                )}
            </div>
        </div>
    )
}
