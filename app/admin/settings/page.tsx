export const dynamic = "force-dynamic"

import { getSettings } from "@/app/actions/settings"
import { getClosedDates } from "@/app/actions/closed-dates"
import { SettingsForm, PasswordForm } from "@/components/admin/settings-form"
import { ClosedDatesManager } from "@/components/admin/closed-dates-manager"

export default async function AdminSettingsPage() {
    const [settings, closedDates] = await Promise.all([getSettings(), getClosedDates()])

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground text-sm">Personalize as informações e preferências do seu salão.</p>
            </div>
            <SettingsForm settings={settings} />
            <PasswordForm />
            <ClosedDatesManager initialDates={closedDates} />
        </div>
    )
}
