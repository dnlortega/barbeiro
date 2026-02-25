"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scissors, Loader2, User, ShieldCheck } from "lucide-react"
import { getLoginCredentials } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [credentials, setCredentials] = useState<any[]>([])

    useEffect(() => {
        const fetchCredentials = async () => {
            const creds = await getLoginCredentials()
            setCredentials(creds)
        }
        fetchCredentials()
    }, [])

    const handleQuickLogin = (email: string) => {
        setEmail(email)
        setPassword("123456") // Assuming default password for quick access in development
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Email ou senha inválidos")
            } else {
                const response = await fetch('/api/auth/session')
                const session = await response.json()

                if (session?.user?.role === "ADMIN") {
                    router.push("/admin")
                } else if (session?.user?.role === "BARBER") {
                    router.push("/pro")
                } else {
                    router.push("/")
                }
                router.refresh()
            }
        } catch (error) {
            setError("Ocorreu um erro ao fazer login")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-black p-4 md:p-10 gap-10">
            {/* Left Side: Title & Branding */}
            <div className="w-full max-w-xl text-center md:text-left space-y-6">
                <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full mb-4">
                    <Scissors className="w-6 h-6 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Ambiente de Controle</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none">
                    Acesso <br /> <span className="text-amber-500 italic">Exclusivo</span>
                </h1>
                <p className="text-slate-400 font-medium italic text-xl max-w-md mx-auto md:mx-0">
                    Acesse sua estação de trabalho e gerencie o fluxo de elite da sua barbearia.
                </p>

                {/* Quick Access Credentials */}
                {credentials.length > 0 && (
                    <div className="pt-10 hidden md:block">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Acesso Rápido (Clique para preencher)</p>
                        <div className="flex flex-wrap gap-4">
                            {credentials.map((cred) => (
                                <button
                                    key={cred.email}
                                    type="button"
                                    onClick={() => handleQuickLogin(cred.email)}
                                    className={cn(
                                        "px-6 py-4 rounded-2xl border-2 transition-all flex items-center gap-3 group text-left",
                                        email === cred.email ? "border-amber-500 bg-amber-500/10" : "border-white/5 bg-white/5 hover:border-white/20"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                        cred.role === 'ADMIN' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'
                                    )}>
                                        {cred.role === 'ADMIN' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">{cred.role}</p>
                                        <p className="text-sm font-bold text-white">{cred.name || cred.email.split('@')[0].toUpperCase()}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Form */}
            <div className="w-full max-w-md relative">
                <div className="bg-slate-900 border-4 border-white/5 rounded-[3.5rem] p-10 md:p-14 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {error && (
                            <div className="bg-red-500/10 border-2 border-red-500/30 text-red-400 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.4em] px-4 text-slate-500">
                                Seu E-mail
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@barbearia.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-16 rounded-2xl bg-white/5 border-2 border-white/5 text-white placeholder:text-slate-600 focus:border-amber-500 focus:ring-0 px-6 font-bold text-lg transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.4em] px-4 text-slate-500">
                                Sua Senha
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-16 rounded-2xl bg-white/5 border-2 border-white/5 text-white placeholder:text-slate-600 focus:border-amber-500 focus:ring-0 px-6 font-bold text-lg transition-all"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-20 rounded-[2rem] bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        AUTENTICANDO...
                                    </>
                                ) : (
                                    "ACESSAR PAINEL"
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Quick Access for Mobile */}
                    <div className="mt-12 md:hidden">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 text-center">Acesso Rápido</p>
                        <div className="grid grid-cols-2 gap-3">
                            {credentials.map((cred) => (
                                <button
                                    key={cred.email}
                                    type="button"
                                    onClick={() => handleQuickLogin(cred.email)}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                        email === cred.email ? "border-amber-500 bg-amber-500/10" : "border-white/5 bg-white/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                        cred.role === 'ADMIN' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'
                                    )}>
                                        {cred.role === 'ADMIN' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 truncate w-full text-center">{cred.name || cred.role}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
    )
}
