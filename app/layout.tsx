import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegistration } from "@/components/pwa/sw-registration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barbearia Premium - O Melhor Corte da Cidade",
  description: "Agende seu horário na Barbearia Premium. Especialistas em barba e cabelo com atendimento personalizado.",
  keywords: ["barbearia", "corte de cabelo", "barba", "agendamento", "premium"],
};

import { getSettings } from "@/app/actions/settings";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const shopName = settings?.barberShopName || "BARBEARIA PREMIUM";

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5e3c" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <ServiceWorkerRegistration />
          <Navbar shopName={shopName} />
          <main className="flex-grow pt-16">
            {children}
          </main>
          <Footer shopName={shopName} phone={settings?.whatsapp} address={settings?.address} />
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
