import { prisma } from "@/lib/prisma"
import { Scissors, Clock, ChevronRight, Star, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const revalidate = 60

export default async function MenuPage() {
    const salon = await prisma.salon.findFirst({
        where: { isAdmin: false },
        include: {
            services: { orderBy: [{ isCombo: "asc" }, { price: "asc" }] },
            workingHours: { orderBy: { dayOfWeek: "asc" } },
        },
        orderBy: { createdAt: "asc" },
    })

    if (!salon) return null

    const regulares = salon.services.filter(s => !s.isCombo)
    const combos = salon.services.filter(s => s.isCombo)

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-primary text-primary-foreground">
                <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                        <Scissors className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">{salon.name}</h1>
                    {salon.address && (
                        <p className="text-sm text-primary-foreground/70 flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3" /> {salon.address}
                        </p>
                    )}
                    {salon.whatsapp && (
                        <p className="text-sm text-primary-foreground/70 flex items-center justify-center gap-1">
                            <Phone className="w-3 h-3" /> {salon.whatsapp}
                        </p>
                    )}
                </div>
            </div>

            {/* Cardápio */}
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
                {/* Serviços */}
                {regulares.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Serviços</h2>
                            <div className="flex-1 border-t border-dashed" />
                        </div>
                        <div className="space-y-2">
                            {regulares.map(s => (
                                <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border hover:border-primary/30 transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary flex items-center justify-center shrink-0 transition-colors">
                                        <Scissors className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm leading-none">{s.name}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">{s.duration} min</span>
                                        </div>
                                    </div>
                                    <p className="text-lg font-black tracking-tight shrink-0">R$ {s.price.toFixed(0)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Combos */}
                {combos.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Combos</h2>
                            <div className="flex-1 border-t border-dashed" />
                        </div>
                        <div className="space-y-2">
                            {combos.map(s => (
                                <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-primary/20 hover:border-primary/50 transition-colors group relative overflow-hidden">
                                    <div className="absolute top-0 right-0">
                                        <Badge className="rounded-none rounded-bl-xl rounded-tr-2xl text-[10px] bg-primary text-primary-foreground">
                                            <Star className="w-2.5 h-2.5 mr-1 fill-current" /> Combo
                                        </Badge>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                                        <Scissors className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-12">
                                        <p className="font-bold text-sm leading-none">{s.name}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">{s.duration} min</span>
                                        </div>
                                    </div>
                                    <p className="text-lg font-black tracking-tight shrink-0 text-primary">R$ {s.price.toFixed(0)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {salon.services.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <Scissors className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Nenhum serviço disponível no momento.</p>
                    </div>
                )}

                {/* CTA */}
                <div className="border-t pt-8 text-center space-y-4">
                    <p className="text-sm text-muted-foreground font-medium">Reserve seu horário agora pelo nosso sistema</p>
                    <Button asChild size="lg" className="rounded-full px-10 font-black tracking-widest h-14 gap-2 shadow-lg shadow-primary/20">
                        <Link href="/book">
                            AGENDAR <ChevronRight className="w-4 h-4" />
                        </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground">Agendamento online · Sem taxa · Confirmação imediata</p>
                </div>
            </div>
        </div>
    )
}
