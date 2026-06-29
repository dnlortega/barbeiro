import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getSettings } from "@/app/actions/settings"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    const settings = await getSettings()
    const shopName = settings?.name || "BARBEARIA PREMIUM"
    return (
        <>
            <Navbar shopName={shopName} />
            <main className="grow pt-16">
                {children}
            </main>
            <Footer shopName={shopName} phone={settings?.whatsapp ?? undefined} address={settings?.address ?? undefined} />
        </>
    )
}
