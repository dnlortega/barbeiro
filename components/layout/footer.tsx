import Link from "next/link"
import { Scissors, Instagram, Facebook, Twitter, Phone, Mail, MapPin } from "lucide-react"

export function Footer({
    shopName = "BARBEARIA PREMIUM",
    phone = "(11) 99999-9999",
    address = "Rua da Elegância, 123"
}: {
    shopName?: string,
    phone?: string,
    address?: string
}) {
    return (
        <footer className="bg-white border-t py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24 mb-16">
                    <div className="space-y-6 col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:rotate-12">
                                <Scissors className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-black text-xl tracking-tighter uppercase">{shopName}</span>
                        </Link>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                            "Excelência em rituais de cuidado masculino. Onde cada detalhe é uma obra de arte."
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Navegação</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                            <li><Link href="/" className="hover:text-primary transition-colors">Início</Link></li>
                            <li><Link href="/services" className="hover:text-primary transition-colors">Serviços</Link></li>
                            <li><Link href="/about" className="hover:text-primary transition-colors">Nossa História</Link></li>
                            <li><Link href="/book" className="hover:text-primary transition-colors">Agendar Agora</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Contatos</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                            <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> {phone}</li>
                            <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> contato@barbearia.com</li>
                            <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /> {address}</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Siga-nos</h4>
                        <div className="flex gap-4">
                            <Link href="#" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                                <Twitter className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                    <p>&copy; {new Date().getFullYear()} {shopName}. TODOS OS DIREITOS RESERVADOS.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-primary">Privacidade</Link>
                        <Link href="#" className="hover:text-primary">Termos</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
