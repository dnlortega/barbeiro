"use client"

import { BookingWizard } from "@/components/booking/booking-wizard"

export default function BookPage() {
    return (
        <div className="min-h-screen pt-24 md:pt-32 px-4 bg-slate-50/50">
            <BookingWizard />
        </div>
    )
}
