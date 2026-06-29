import { BookingWizard } from "@/components/booking/booking-wizard"
import { getPublicSalon } from "@/app/actions/settings"

interface Props {
    searchParams: Promise<{ salon?: string }>
}

export default async function BookPage({ searchParams }: Props) {
    const { salon: slug } = await searchParams
    const salonData = await getPublicSalon(slug)

    if (!salonData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Salão não encontrado.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 md:pt-32 px-4 bg-slate-50/50">
            <BookingWizard salonId={salonData.id} salonPhone={salonData.whatsapp ?? ""} />
        </div>
    )
}
