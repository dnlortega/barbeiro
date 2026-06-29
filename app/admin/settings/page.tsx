export const dynamic = "force-dynamic"

import { getSettings } from "@/app/actions/settings"
import { getClosedDates } from "@/app/actions/closed-dates"
import { getWorkingHours } from "@/app/actions/working-hours"
import { SettingsForm, PasswordForm } from "@/components/admin/settings-form"
import { ClosedDatesManager } from "@/components/admin/closed-dates-manager"
import { QrCodeCard } from "@/components/admin/qr-code-card"
import { WorkingHoursForm } from "@/components/admin/working-hours-form"
import { auth } from "@/lib/auth"

export default async function AdminSettingsPage() {
    const session = await auth()
    const isAdmin = session?.user?.isAdmin ?? false

    const [settings, closedDates, workingHours] = await Promise.all([
        getSettings(),
        getClosedDates(),
        !isAdmin ? getWorkingHours() : Promise.resolve([]),
    ])

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground text-sm">Personalize as informações e preferências do seu salão.</p>
            </div>
            <SettingsForm settings={settings} />
            <PasswordForm />
            {!isAdmin && workingHours.length > 0 && <WorkingHoursForm initialHours={workingHours} />}
            {!isAdmin && <QrCodeCard salonName={settings?.name ?? "Salão"} />}
            <ClosedDatesManager initialDates={closedDates} />
        </div>
    )
}
