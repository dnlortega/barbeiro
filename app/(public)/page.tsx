import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Scissors, Star, ShieldCheck, Clock, MapPin, Phone, ChevronRight, Package, Sparkles } from "lucide-react"
import { prisma } from "@/lib/prisma"

const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function fmtTime(t: string): string {
    const [h, m] = t.split(":")
    return m === "00" ? `${h}h` : `${h}h${m}`
}

function formatWorkingHours(hours: { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }[]): string {
    const openDays = hours.filter(h => h.isOpen)
    if (openDays.length === 0) return "Fechado"
    const first = openDays[0]
    const last = openDays[openDays.length - 1]
    const sameHours = openDays.every(d => d.openTime === first.openTime && d.closeTime === first.closeTime)
    const dayRange = openDays.length === 1
        ? DAY_NAMES_SHORT[first.dayOfWeek]
        : `${DAY_NAMES_SHORT[first.dayOfWeek]} – ${DAY_NAMES_SHORT[last.dayOfWeek]}`
    return sameHours ? `${dayRange}: ${fmtTime(first.openTime)} às ${fmtTime(first.closeTime)}` : `${dayRange}: ver horários`
}

export default async function Home() {
    const salons = await prisma.salon.findMany({
        where: { isAdmin: false },
        include: {
            services: { where: { isCombo: false }, orderBy: { price: "asc" }, take: 3 },
            workingHours: { orderBy: { dayOfWeek: "asc" } },
        },
        take: 3,
        orderBy: { createdAt: "asc" },
    })

    const primarySalon = salons[0]
    const featuredServices = primarySalon?.services ?? []
    const hoursText = primarySalon?.workingHours?.length
        ? formatWorkingHours(primarySalon.workingHours)
        : "Seg – Sáb: 09h às 18h"

    const contactItems = [
        { icon: MapPin, title: "Localização", desc: primarySalon?.address || "Consulte pelo WhatsApp" },
        { icon: Clock, title: "Horários", desc: hoursText },
        { icon: Phone, title: "Contato", desc: primarySalon?.whatsapp || "Consulte nossas unidades" },
    ]

    const MARQUEE_ITEMS = [
        "CORTE CLÁSSICO", "BARBA RITUAL", "BIGODE PERFEITO", "VISAGISMO", "BARBOTERAPIA",
        "HIDRATAÇÃO", "NAVALHA", "POMADA PREMIUM", "TOALHA QUENTE", "SOBRANCELHA",
        "CORTE CLÁSSICO", "BARBA RITUAL", "BIGODE PERFEITO", "VISAGISMO", "BARBOTERAPIA",
        "HIDRATAÇÃO", "NAVALHA", "POMADA PREMIUM", "TOALHA QUENTE", "SOBRANCELHA",
    ]

    return (
        <div className="flex flex-col w-full overflow-x-hidden">
            {/* Hero */}
            <section className="relative min-h-[90vh] flex flex-col pt-20">
                <div className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />
                </div>

                {/* Floating barber icons */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <Scissors className="absolute text-white animate-barber-float w-16 h-16 top-[15%] left-[8%] rotate-[-30deg]" />
                    <Scissors className="absolute text-white animate-barber-float-r w-10 h-10 top-[30%] right-[10%] rotate-[60deg]" style={{ animationDelay: "2s" }} />
                    <Scissors className="absolute text-white animate-barber-float-slow w-20 h-20 bottom-[40%] left-[15%] rotate-[120deg]" style={{ animationDelay: "4s" }} />
                    <Scissors className="absolute text-white animate-barber-float w-8 h-8 top-[55%] right-[20%] rotate-[-75deg]" style={{ animationDelay: "1.5s" }} />
                    <Star className="absolute text-primary animate-barber-float-r w-6 h-6 top-[20%] right-[30%]" style={{ animationDelay: "3s" }} />
                    <Sparkles className="absolute text-white/20 animate-barber-float-slow w-12 h-12 top-[45%] left-[5%]" style={{ animationDelay: "0.5s" }} />
                </div>

                {/* Barber pole stripe - left edge */}
                <div className="absolute left-0 top-0 bottom-0 w-2 barber-pole z-10 hidden lg:block" />

                {/* Main content */}
                <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="container px-4 text-center space-y-8 animate-shimmer-in">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs md:text-sm font-bold tracking-widest uppercase backdrop-blur-md mx-auto">
                            <Star className="w-4 h-4 text-primary fill-primary" />
                            <span>Referência em Estilo Masculino</span>
                        </div>

                        <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-white max-w-5xl mx-auto leading-[0.9] uppercase">
                            A Arte da <br />
                            <span className="text-primary italic">Barbearia</span> <br />
                            Redefinida
                        </h1>

                        <p className="text-lg md:text-2xl text-white/80 max-w-2xl mx-auto font-medium">
                            Onde a tradição encontra a modernidade para criar o seu melhor visual.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <Button asChild size="lg" className="rounded-full px-6 sm:px-12 h-12 sm:h-16 text-sm sm:text-lg font-black tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
                                <Link href="/book">AGENDAR AGORA</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="rounded-full px-6 sm:px-12 h-12 sm:h-16 text-sm sm:text-lg font-black tracking-widest border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all">
                                <Link href="/services">VER SERVIÇOS</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Contact cards */}
                <div className="relative z-10 w-full pb-10 pt-8 bg-background">
                    <div className="container px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
                            {contactItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm animate-shimmer-in" style={{ animationDelay: `${i * 0.15}s` }}>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <item.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{item.title}</h4>
                                        <p className="text-sm font-bold text-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Marquee ticker */}
            <div className="w-full bg-primary overflow-hidden py-4 border-y border-primary/20">
                <div className="flex animate-marquee-left whitespace-nowrap">
                    {MARQUEE_ITEMS.map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-6 text-primary-foreground text-sm font-black tracking-[0.25em] uppercase px-6">
                            {item}
                            <span className="opacity-40 text-lg leading-none">·</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Nossas Unidades */}
            {salons.length > 0 && (
                <section className="section-padding bg-muted/20">
                    <div className="container px-4 mx-auto">
                        <div className="text-center mb-14 space-y-4">
                            <h2 className="text-sm font-black tracking-[0.3em] text-primary uppercase">Onde nos encontrar</h2>
                            <h3 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter">
                                Nossas <span className="text-primary italic">Unidades</span>
                            </h3>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                Escolha a unidade mais próxima e agende seu horário com nossos especialistas.
                            </p>
                        </div>

                        <div className={`grid gap-8 ${salons.length === 1 ? "max-w-md mx-auto" : salons.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto" : "grid-cols-1 md:grid-cols-3"}`}>
                            {salons.map((salon, i) => {
                                const hoursStr = salon.workingHours?.length
                                    ? formatWorkingHours(salon.workingHours)
                                    : "Seg – Sáb: 09h às 18h"
                                return (
                                    <div
                                        key={salon.id}
                                        className="group relative bg-card border border-border/50 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] animate-shimmer-in flex flex-col"
                                        style={{ animationDelay: `${i * 0.12}s` }}
                                    >
                                        {/* Number badge */}
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 group-hover:bg-primary transition-colors duration-500 flex items-center justify-center mb-6 shrink-0">
                                            <span className="text-xl font-black text-primary group-hover:text-primary-foreground transition-colors duration-500">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-black uppercase tracking-tight mb-4">{salon.name}</h3>

                                        <div className="space-y-3 flex-1">
                                            {salon.address && (
                                                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary/60" />
                                                    <span>{salon.address}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4 shrink-0 text-primary/60" />
                                                <span>{hoursStr}</span>
                                            </div>
                                            {salon.whatsapp && (
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <Phone className="w-4 h-4 shrink-0 text-primary/60" />
                                                    <span>{salon.whatsapp}</span>
                                                </div>
                                            )}
                                        </div>

                                        <Button asChild className="w-full rounded-full font-black tracking-widest text-sm h-12 mt-8">
                                            <Link href="/book">
                                                AGENDAR <ChevronRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Serviços em destaque */}
            <section className="section-padding bg-background relative overflow-hidden">
                {/* Background scissors decoration */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <Scissors className="absolute text-muted w-64 h-64 -bottom-16 -right-16 rotate-[-20deg] opacity-5" />
                    <Scissors className="absolute text-muted w-32 h-32 top-8 left-8 rotate-[60deg] opacity-5" />
                </div>

                <div className="container px-4 mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="space-y-4 max-w-xl">
                            <h2 className="text-sm font-black tracking-[0.3em] text-primary uppercase">Experiência Única</h2>
                            <h3 className="text-2xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter">Nossos <span className="text-primary italic">Serviços</span></h3>
                            <p className="text-lg text-muted-foreground">Cada ritual é planejado para o máximo conforto e um resultado impecável.</p>
                        </div>
                        <Button asChild variant="link" className="text-primary font-black uppercase tracking-widest p-0 h-auto">
                            <Link href="/services" className="flex items-center gap-2">Ver Catálogo Completo <ChevronRight className="w-4 h-4" /></Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                        {featuredServices.length > 0 ? featuredServices.map(service => (
                            <div key={service.id} className="group relative p-5 sm:p-8 md:p-10 rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                                <div className="w-16 h-16 rounded-2xl bg-muted group-hover:bg-primary transition-colors duration-500 flex items-center justify-center mb-8">
                                    <Scissors className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">{service.name}</h4>
                                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">{service.duration} min</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">A partir de</span>
                                        <span className="text-3xl font-black tracking-tighter">R$ {service.price.toFixed(0)}</span>
                                    </div>
                                    <Button asChild size="icon" className="rounded-full w-12 h-12 shadow-lg shadow-primary/20 transition-transform group-hover:translate-x-1">
                                        <Link href="/book"><ChevronRight className="w-6 h-6" /></Link>
                                    </Button>
                                </div>
                            </div>
                        )) : [
                            { title: "Corte Clássico", price: "50", desc: "Técnicas avançadas para o corte perfeito.", icon: Scissors },
                            { title: "Barba Ritual", price: "40", desc: "Toalha quente e massagem facial premium.", icon: Star },
                            { title: "Combo Completo", price: "80", desc: "Corte + barba — o pacote premium.", icon: Package },
                        ].map((service, i) => (
                            <div key={i} className="group relative p-5 sm:p-8 md:p-10 rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/30 transition-all duration-500">
                                <div className="w-16 h-16 rounded-2xl bg-muted group-hover:bg-primary transition-colors duration-500 flex items-center justify-center mb-8">
                                    <service.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">{service.title}</h4>
                                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">{service.desc}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">A partir de</span>
                                        <span className="text-3xl font-black tracking-tighter">R$ {service.price}</span>
                                    </div>
                                    <Button asChild size="icon" className="rounded-full w-12 h-12 shadow-lg shadow-primary/20 transition-transform group-hover:translate-x-1">
                                        <Link href="/book"><ChevronRight className="w-6 h-6" /></Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Diferenciais */}
            <section className="section-padding bg-muted/30">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 bg-muted">
                                <img
                                    src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1976&auto=format&fit=crop"
                                    alt="Barbeiro Profissional"
                                    className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20" />
                            <div className="absolute top-1/2 -left-8 -translate-y-1/2 p-8 bg-background border rounded-3xl shadow-xl hidden md:block z-20">
                                <p className="text-4xl font-black text-primary italic">10+</p>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Anos de <br />Excelência</p>
                            </div>
                            {/* Floating scissors accent */}
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center z-20 shadow-xl hidden md:flex">
                                <Scissors className="w-7 h-7 text-primary-foreground rotate-45" />
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h2 className="text-sm font-black tracking-[0.3em] text-primary uppercase">Tradição & Estilo</h2>
                                <h3 className="text-2xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                                    Elevamos Sua <br /><span className="text-primary italic">Autoestima</span>
                                </h3>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    Não somos apenas uma barbearia. Somos um hub de estilo masculino onde cada corte é tratado como uma obra de arte.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[
                                    { title: "Visagismo", desc: "Análise facial completa." },
                                    { title: "Barboterapia", desc: "O relaxamento que você merece." },
                                    { title: "Coffee & Beer", desc: "Bebidas cortesia." },
                                    { title: "Curadoria", desc: "Produtos exclusivos para barba." },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="font-black uppercase tracking-widest text-sm">{item.title}</h5>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button asChild size="lg" className="rounded-full px-12 h-16 font-black tracking-widest text-lg shadow-xl shadow-primary/20">
                                <Link href="/services">VER TODOS OS SERVIÇOS</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding bg-background relative overflow-hidden">
                <div className="container px-4 mx-auto">
                    <div className="relative group overflow-hidden bg-primary p-12 md:p-32 rounded-[3.5rem] shadow-2xl shadow-primary/30">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl transition-transform group-hover:scale-125 duration-1000" />
                        {/* Floating scissors in CTA */}
                        <Scissors className="absolute bottom-8 left-8 w-24 h-24 text-white/5 rotate-[30deg] pointer-events-none" />
                        <Scissors className="absolute top-8 right-24 w-16 h-16 text-white/5 rotate-[-60deg] pointer-events-none" />
                        <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white max-w-3xl leading-[0.9]">
                                Pronto para <br />
                                sua <span className="italic text-black/40">Transformação?</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-white/80 max-w-xl font-medium">
                                Reserve agora e garanta seu lugar com os melhores especialistas da cidade.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <Button asChild size="lg" variant="secondary" className="rounded-full px-16 h-20 text-xl font-black tracking-widest hover:scale-105 transition-all">
                                    <Link href="/book">AGENDAR AGORA</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="rounded-full px-16 h-20 text-xl font-black tracking-widest border-white/20 text-white hover:bg-white/10 transition-all">
                                    <Link href="/services">SERVIÇOS</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
