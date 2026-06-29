import { prisma } from "@/lib/prisma"
import { Scissors, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ServicesPage() {
    const salons = await prisma.salon.findMany({
        where: { isAdmin: false },
        include: {
            services: { orderBy: { price: "asc" } },
        },
        orderBy: { name: "asc" },
    })

    return (
        <div className="min-h-screen pt-24 md:pt-32 px-4 pb-16">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-3">
                    <p className="text-xs font-bold tracking-[0.4em] text-primary uppercase">Cardápio de Serviços</p>
                    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                        Nossos <span className="text-primary italic">Serviços</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        Escolha o serviço ideal e reserve diretamente com o profissional da sua preferência.
                    </p>
                </div>

                {/* Salões e seus serviços */}
                {salons.map(salon => (
                    <div key={salon.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">{salon.name}</h2>
                            {salon.address && <p className="text-sm text-muted-foreground hidden sm:block">{salon.address}</p>}
                        </div>

                        {salon.services.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 border border-dashed rounded-lg text-center">
                                Nenhum serviço cadastrado.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {salon.services.map(service => (
                                    <div key={service.id} className="group p-5 rounded-2xl bg-card border hover:border-primary/30 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <Scissors className="w-4 h-4" />
                                            </div>
                                            <span className="text-lg font-black text-primary tracking-tight">
                                                R$ {service.price.toFixed(0)}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-base mb-1">{service.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>{service.duration} min</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* CTA */}
                <div className="mt-8 p-8 md:p-12 rounded-3xl bg-muted/50 border text-center space-y-6">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                        Pronto para <span className="text-primary italic">Agendar?</span>
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Reserve seu horário agora e garanta o atendimento com o profissional da sua escolha.
                    </p>
                    <Button asChild size="lg" className="rounded-full px-10 font-bold gap-2">
                        <Link href="/book">
                            Agendar agora <ChevronRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
