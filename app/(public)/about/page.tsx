"use client"

import { Scissors, Star, Users, MapPin, Phone, Mail, Instagram, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
    return (
        <div className="flex flex-col w-full overflow-x-hidden">
            {/* Hero / Header Section */}
            <section className="relative pt-40 pb-20 md:pt-60 md:pb-32 bg-background border-b overflow-hidden">
                <div className="container px-4 mx-auto relative z-10">
                    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-left-10 duration-700">
                        <h2 className="text-sm font-black tracking-[0.4em] text-primary uppercase">Onde Estilo Encontra Tradição</h2>
                        <h1 className="text-3xl sm:text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8]">
                            Mais que um Corte, <br />
                            <span className="text-primary italic">um Ritual.</span>
                        </h1>
                        <p className="text-base sm:text-xl md:text-3xl text-muted-foreground leading-relaxed max-w-3xl font-medium pt-4">
                            Desde 2012, redefinindo o conceito de barbearia clássica em um ambiente pensado exclusivamente para a experiência masculina.
                        </p>
                    </div>
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[30vw] h-[60vh] bg-primary rounded-l-[10rem] opacity-5 -z-0 hidden md:block" />
            </section>

            {/* Narrative Section */}
            <section className="section-padding">
                <div className="container px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                    <div className="relative group">
                        <div className="aspect-[3/4] rounded-[4rem] overflow-hidden shadow-2xl relative z-10 transition-transform duration-700 hover:scale-[1.02]">
                            <img
                                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop"
                                alt="Nosso Espaço"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-0" />
                        <div className="absolute -bottom-10 right-10 p-10 bg-black text-white rounded-[3rem] shadow-2xl hidden md:block z-20">
                            <p className="text-sm font-black uppercase tracking-widest text-primary mb-2">Since</p>
                            <p className="text-6xl font-black tracking-tighter italic">2012</p>
                        </div>
                    </div>

                    <div className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-700">
                        <div className="space-y-6">
                            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Nossa <span className="text-primary italic">História</span></h3>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                                Fundada por apaixonados pela barbearia "old school", a Barbearia Premium nasceu com o propósito de resgatar o ritual do barbear tradicional, unindo-o às técnicas de visagismo mais modernas do mundo.
                            </p>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                                Cada detalhe da nossa casa foi projetado para ser um refúgio. Aqui, o tempo passa devagar. Valorizamos o bom papo, o café moído na hora e a precisão milimétrica de cada acabamento.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-6">
                            {[
                                { label: "Clientes", value: "10K+" },
                                { label: "Mestres", value: "12" },
                                { label: "Unidades", value: "02" }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-2xl sm:text-4xl md:text-5xl font-black text-primary tracking-tighter italic">{stat.value}</p>
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <Button asChild size="lg" className="rounded-full px-10 h-16 font-black tracking-widest uppercase shadow-xl shadow-primary/20">
                                <Link href="/book">Reserve seu Momento</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values / Icons */}
            <section className="section-padding bg-muted/30 border-y">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
                        {[
                            { icon: Scissors, title: "Precisão", desc: "Ferramentas suíças e técnicas internacionais para o ajuste milimétrico." },
                            { icon: Star, title: "Curadoria", desc: "Produtos de marcas globais selecionados para a saúde capilar masculina." },
                            { icon: Users, title: "Comunidade", desc: "Mais que clientes, formamos um círculo de homens modernos e decididos." }
                        ].map((value, i) => (
                            <div key={i} className="group text-center space-y-4 sm:space-y-6 p-5 sm:p-8 rounded-4xl sm:rounded-[3rem] bg-background border border-border/50 transition-all hover:shadow-xl hover:border-primary/20">
                                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                                    <value.icon className="w-8 h-8" />
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter">{value.title}</h4>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed italic">"{value.desc}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Professional Contact Grid */}
            <section className="section-padding bg-background">
                <div className="container px-4 mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-sm font-black tracking-[0.4em] text-primary uppercase">Onde Estamos</h2>
                            <h3 className="text-2xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">Nos Encontre</h3>
                        </div>
                        <Button variant="outline" className="rounded-full px-8 font-black uppercase tracking-widest flex gap-2">
                            Abrir no Maps <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: MapPin, label: "Endereço", value: "Rua da Elegância, 123", sub: "Centro - São Paulo, SP" },
                            { icon: Phone, label: "Telefone", value: "(11) 99999-9999", sub: "Disponível via WhatsApp" },
                            { icon: Mail, label: "E-mail", value: "contato@barbearia.com", sub: "Respondemos em 24h" }
                        ].map((item, i) => (
                            <div key={i} className="p-5 sm:p-10 rounded-4xl sm:rounded-[2.5rem] bg-card border border-border/50 space-y-4 sm:space-y-6 hover:shadow-lg transition-all">
                                <item.icon className="w-8 h-8 text-primary" />
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">{item.label}</h4>
                                    <p className="text-xl font-black uppercase tracking-tighter">{item.value}</p>
                                    <p className="text-xs font-bold text-muted-foreground uppercase opacity-70 tracking-widest">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 flex justify-center gap-4">
                        <Button size="icon" className="w-12 h-12 rounded-full shadow-lg hover:shadow-primary/30"><Instagram className="w-6 h-6" /></Button>
                        <Button variant="outline" size="lg" className="rounded-full px-12 font-black uppercase tracking-widest">Siga-nos no Insta</Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
