import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import { ServiceWorkerRegistration } from "@/components/pwa/sw-registration"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Barbearia Premium - O Melhor Corte da Cidade",
    description: "Agende seu horário na Barbearia Premium.",
    keywords: ["barbearia", "corte de cabelo", "barba", "agendamento", "premium"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#8b5e3c" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
                <Providers>
                    <ServiceWorkerRegistration />
                    {children}
                    <Toaster position="top-center" richColors />
                </Providers>
            </body>
        </html>
    )
}
