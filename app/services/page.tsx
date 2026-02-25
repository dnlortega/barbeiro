"use client"

import { Scissors, Star, ShieldCheck, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ServicesPage() {
    const categories = [
        {
            name: "Cabelo",
            tagline: "A base do seu estilo",
            icon: Scissors,
            services: [
                { name: "Corte Tradicional", price: "50", duration: "30", desc: "Acabamento clássico realizado com técnica de tesoura e máquina." },
                { name: "Corte Moderno / Fade", price: "60", duration: "45", desc: "Degradê de alta precisão com navalha e técnicas de visagismo." },
                { name: "Corte Infantil", price: "40", duration: "30", desc: "Paciência e técnica para o visual dos pequenos (até 12 anos)." },
                { name: "Lavagem Premium", price: "20", duration: "15", desc: "Shampoo artesanal com massagem capilar estimulante." },
            ]
        },
        {
            name: "Barba",
            tagline: "O ritual do homem",
            icon: Star,
            services: [
                { name: "Barba Simples", price: "35", duration: "20", desc: "Aparagem rápida e contorno preciso." },
                { name: "Barba Ritual", price: "50", duration: "40", desc: "Toalha quente, óleos essenciais e barbear tradicional com navalha." },
                { name: "Design de Barba", price: "40", duration: "30", desc: "Escultura facial para realçar seus traços naturais." },
            ]
        },
        {
            name: "Combos",
            tagline: "Tratamento completo",
            icon: ShieldCheck,
            services: [
                { name: "Combo Clássico", price: "85", duration: "60", desc: "Corte Tradicional + Barba Simples. O essencial para sua semana." },
                { name: "Combo Premium", price: "100", duration: "90", desc: "Corte Moderno + Barba Ritual + Uma dose de Whisky." },
                { name: "Dia do Noivo", price: "Consulte", duration: "180", desc: "Pacote exclusivo com todos os cuidados para o grande dia." },
            ]
        }
    ]

    return (
        <div className="container-tight section-padding pt-32">
            <div className="max-w-3xl mb-16 md:mb-24 space-y-6">
                <h2 className="text-sm font-black tracking-[0.3em] text-primary uppercase animate-in fade-in duration-500">Cardápio de Experiências</h2>
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-left-10 duration-700">
                    Nossos <br /><span className="text-primary italic">Serviços</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground animate-in fade-in duration-1000">
                    Escolha entre o essencial e o extraordinário.
                </p>
            </div>

            <div className="space-y-24 md:space-y-32">
                {categories.map((category, idx) => (
                    <div key={idx} className="space-y-10 group animate-in fade-in slide-in-from-bottom-10 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 border-b border-border pb-6">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                                <category.icon className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">{category.name}</h2>
                                <p className="text-sm font-black uppercase tracking-widest text-primary italic opacity-70">{category.tagline}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {category.services.map((service, sIdx) => (
                                <div key={sIdx} className="group/item flex flex-col justify-between p-8 rounded-[2rem] bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none group-hover/item:text-primary transition-colors">{service.name}</h3>
                                            <span className="text-2xl font-black tracking-tighter text-primary whitespace-nowrap">
                                                {typeof service.price === 'string' && !isNaN(Number(service.price)) ? `R$ ${service.price}` : service.price}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{service.desc}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-8 mt-auto">
                                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {service.duration} MINutos</span>
                                        </div>
                                        <Button asChild variant="outline" size="sm" className="rounded-full px-6 font-black uppercase tracking-widest border-primary/20 hover:bg-primary hover:text-primary-foreground group-hover/item:scale-105 transition-all">
                                            <Link href="/book">RESERVAR</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Clear/Professional Call to Action */}
            <div className="mt-32 p-10 md:p-20 rounded-[3rem] bg-muted/50 border border-border/50 text-center space-y-8 animate-in zoom-in duration-700">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Precisa de <br /><span className="text-primary italic">Ajuda?</span></h2>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                    Nossa equipe está à disposição para indicar o melhor profissional para suas necessidades.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg" className="rounded-full px-12 h-16 font-black tracking-widest shadow-xl shadow-primary/20">
                        <Link href="/book">AGENDAR AGORA</Link>
                    </Button>
                    <Button variant="ghost" size="lg" className="rounded-full px-12 h-16 font-black tracking-widest hover:bg-background">
                        Falar pelo WhatsApp
                    </Button>
                </div>
            </div>
        </div>
    )
}
