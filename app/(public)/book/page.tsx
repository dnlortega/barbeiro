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
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <p className="text-2xl font-bold">Salão não encontrado</p>
                <p className="text-muted-foreground">Verifique o link e tente novamente.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 md:pt-32 px-4 bg-slate-50/50">
            <BookingWizard
                salonId={salonData.id}
                salonPhone={salonData.whatsapp ?? ""}
                salonAddress={salonData.address ?? ""}
                salonName={salonData.name}
            />
        </div>
    )
}
