import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Scissors, Star, ShieldCheck, Clock, MapPin, Phone, ChevronRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />
        </div>

        <div className="container relative z-10 px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button asChild size="lg" className="rounded-full px-12 h-16 text-lg font-black tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
              <Link href="/book">AGENDAR AGORA</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-12 h-16 text-lg font-black tracking-widest border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all">
              <Link href="/services">VER SERVIÇOS</Link>
            </Button>
          </div>
        </div>

        {/* Hero Bottom Info - Professional/Grid */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background to-transparent pt-20 pb-10">
          <div className="container px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
              {[
                { icon: MapPin, title: "Localização", desc: "Rua da Elegância, 123 - Centro" },
                { icon: Clock, title: "Horários", desc: "Seg - Sáb: 09h às 20h" },
                { icon: Phone, title: "Contato", desc: "(11) 99999-9999" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-card/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-white/60">{item.title}</h4>
                    <p className="text-sm font-bold text-white">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Clean/Clear */}
      <section className="section-padding bg-background relative overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4 max-w-xl">
              <h2 className="text-sm font-black tracking-[0.3em] text-primary uppercase">Experiência Única</h2>
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Nossos <span className="text-primary italic">Serviços</span></h3>
              <p className="text-lg text-muted-foreground">Cada ritual é planejado para o máximo conforto e um resultado impecável.</p>
            </div>
            <Button asChild variant="link" className="text-primary font-black uppercase tracking-widest p-0 h-auto">
              <Link href="/services" className="flex items-center gap-2">Ver Catálogo Completo <ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {[
              { title: "Corte Elite", price: "50", desc: "Técnicas avançadas de visagismo para o corte perfeito.", icon: Scissors },
              { title: "Barba Ritual", price: "40", desc: "Toalha quente e massagem facial com produtos premium.", icon: Star },
              { title: "Combo Black", price: "80", desc: "O pacote completo para quem não abre mão do melhor.", icon: ShieldCheck },
            ].map((service, i) => (
              <div key={i} className="group relative p-8 md:p-10 rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
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

      {/* Professional Transformation Section */}
      <section className="section-padding bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1599351431247-f10b21817021?q=80&w=1976&auto=format&fit=crop"
                  alt="Barbeiro Profissional"
                  className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 -z-0" />
              <div className="absolute top-1/2 -left-8 -translate-y-1/2 p-8 bg-background border rounded-3xl shadow-xl hidden md:block z-20">
                <p className="text-4xl font-black text-primary italic">10+</p>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Anos de <br />Excelência</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-sm font-black tracking-[0.3em] text-primary uppercase">Tradição & Estilo</h2>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">Elevamos Sua <br /><span className="text-primary italic">Autoestima</span></h3>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Não somos apenas uma barbearia. Somos um hub de estilo masculino onde cada corte é tratado como uma obra de arte.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: "Visagismo", desc: "Análise facial completa." },
                  { title: "Barboterapia", desc: "O relaxamento que você merece." },
                  { title: "Coffee & Beer", desc: "As melhores bebidas cortesia." },
                  { title: "Curadoria", desc: "Produtos exclusivos para barba." }
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

              <div className="pt-4">
                <Button asChild size="lg" className="rounded-full px-12 h-16 font-black tracking-widest text-lg shadow-xl shadow-primary/20">
                  <Link href="/about">CONHEÇA NOSSA HISTÓRIA</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="section-padding bg-background relative overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="relative group overflow-hidden bg-primary p-12 md:p-32 rounded-[3.5rem] shadow-2xl shadow-primary/30">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl transition-transform group-hover:scale-125 duration-1000" />

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
