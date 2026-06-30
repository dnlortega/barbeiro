"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scissors, Menu, X, Instagram, Phone } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function Navbar({ shopName = "BARBERARIA PREMIUM" }: { shopName?: string }) {
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    const navLinks = [
        { name: "Início", href: "/" },
        { name: "Serviços", href: "/services" },
        { name: "Cardápio", href: "/menu" },
        { name: "Sobre", href: "/about" },
    ]

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <nav className={cn(
            "fixed top-0 w-full z-50 transition-all duration-300",
            isScrolled ? "bg-background/80 backdrop-blur-lg border-b py-2" : "bg-transparent py-4"
        )}>
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
                        <Scissors className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-xl tracking-tight uppercase">{shopName}</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-bold uppercase tracking-widest transition-all hover:text-primary relative py-1",
                                pathname === link.href ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary" : "text-muted-foreground"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Button asChild className="rounded-full px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        <Link href="/book">AGENDAR</Link>
                    </Button>
                </div>

                {/* Mobile Navigation Toggle */}
                <div className="md:hidden flex items-center gap-4">
                    <Button asChild size="sm" className="rounded-full px-5 font-bold">
                        <Link href="/book">AGENDAR</Link>
                    </Button>
                    {mounted && (
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="flex flex-col p-8 w-[300px]">
                                <SheetTitle className="text-left mb-8 flex items-center gap-2">
                                    <Scissors className="h-5 w-5 text-primary" />
                                    {shopName}
                                </SheetTitle>
                                <div className="flex flex-col gap-6">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                "text-2xl font-black uppercase tracking-tighter transition-colors",
                                                pathname === link.href ? "text-primary" : "text-muted-foreground"
                                            )}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-auto space-y-6 pt-10">
                                    <div className="flex gap-4">
                                        <Button size="icon" variant="outline" className="rounded-full">
                                            <Instagram className="w-5 h-5" />
                                        </Button>
                                        <Button size="icon" variant="outline" className="rounded-full">
                                            <Phone className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                                        Rua da Elegância, 123 - Centro <br />
                                        (11) 99999-9999
                                    </p>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>
        </nav>
    )
}
