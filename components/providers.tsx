"use client"
import * as React from "react"
import { SessionProvider } from "next-auth/react"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ReactQueryProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
            </ReactQueryProvider>
        </SessionProvider>
    )
}
