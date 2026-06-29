"use client"

import { useState } from "react"
import { Download, QrCode, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function QrCodeCard({ salonName }: { salonName: string }) {
    const [copied, setCopied] = useState(false)

    const bookingUrl = typeof window !== "undefined"
        ? `${window.location.origin}/book`
        : "/book"

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingUrl)}&bgcolor=ffffff&color=000000&margin=10`

    const handleCopy = async () => {
        await navigator.clipboard.writeText(bookingUrl)
        setCopied(true)
        toast.success("Link copiado!")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const link = document.createElement("a")
        link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(bookingUrl)}&bgcolor=ffffff&color=000000&margin=20`
        link.download = `qrcode_${salonName.replace(/\s+/g, "_").toLowerCase()}.png`
        link.target = "_blank"
        link.click()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <QrCode className="w-5 h-5" /> QR Code de Agendamento
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Imprima ou exiba para os clientes escanearem e fazerem agendamentos.
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* QR Code */}
                    <div className="shrink-0 p-3 border-2 rounded-xl bg-white shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={qrUrl}
                            alt="QR Code de agendamento"
                            width={160}
                            height={160}
                            className="block"
                        />
                    </div>

                    {/* Info + ações */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Link de agendamento</p>
                            <div className="flex gap-2">
                                <Input value={bookingUrl} readOnly className="text-xs font-mono" />
                                <Button size="icon" variant="outline" onClick={handleCopy}>
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-1" /> Baixar QR Code
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Dica: Cole o QR Code em cartões de visita, cardápios ou na porta do salão.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
