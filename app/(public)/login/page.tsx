"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Scissors, Loader2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const DEMO_ACCOUNTS = [
    { label: "Admin geral", email: "admin@barbearia.com", password: "admin123", color: "text-purple-600" },
    { label: "Barbearia Imperial", email: "imperial@barbearia.com", password: "123456", color: "text-blue-600" },
    { label: "Barbearia Clássica", email: "classica@barbearia.com", password: "123456", color: "text-emerald-600" },
    { label: "Barbearia Premium", email: "premium@barbearia.com", password: "123456", color: "text-amber-600" },
]

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showDemo, setShowDemo] = useState(false)
    const [copied, setCopied] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const result = await signIn("credentials", { email, password, redirect: false })
            if (result?.error) {
                setError("E-mail ou senha inválidos.")
            } else {
                router.push("/admin")
                router.refresh()
            }
        } catch {
            setError("Erro inesperado. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    const fillAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
        setEmail(acc.email)
        setPassword(acc.password)
        setError("")
    }

    const copyText = (text: string, key: string) => {
        navigator.clipboard.writeText(text)
        setCopied(key)
        setTimeout(() => setCopied(null), 1500)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
            <div className="w-full max-w-sm space-y-5">
                {/* Logo */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                        <Scissors className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Área do Salão</h1>
                        <p className="text-sm text-muted-foreground">Acesse o painel do seu estabelecimento</p>
                    </div>
                </div>

                {/* Formulário */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Entrar</CardTitle>
                        <CardDescription>Use o e-mail e senha do seu salão</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder="salao@exemplo.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {loading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Contas de demonstração */}
                <div className="rounded-lg border bg-card overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowDemo(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                        <span>Contas de demonstração</span>
                        {showDemo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showDemo && (
                        <div className="border-t divide-y">
                            {DEMO_ACCOUNTS.map(acc => (
                                <div key={acc.email} className="px-4 py-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className={cn("text-xs font-semibold uppercase tracking-wide", acc.color)}>{acc.label}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs text-muted-foreground"
                                            onClick={() => fillAccount(acc)}
                                        >
                                            Usar
                                        </Button>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-muted-foreground font-mono truncate">{acc.email}</span>
                                            <button
                                                type="button"
                                                onClick={() => copyText(acc.email, `${acc.email}-email`)}
                                                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {copied === `${acc.email}-email` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-muted-foreground font-mono">{acc.password}</span>
                                            <button
                                                type="button"
                                                onClick={() => copyText(acc.password, `${acc.email}-pass`)}
                                                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {copied === `${acc.email}-pass` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
