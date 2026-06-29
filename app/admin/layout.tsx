import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { getWaitListCount } from "@/app/actions/waitlist"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const waitingCount = await getWaitListCount()
    const isAdmin = session.user?.isAdmin ?? false

    return (
        <div className="min-h-screen bg-background flex">
            <AdminSidebar
                userName={session.user?.name ?? ""}
                userEmail={session.user?.email ?? ""}
                waitingCount={waitingCount}
                isAdmin={isAdmin}
            />
            <div className="flex-1 md:ml-16 pt-14 md:pt-0 min-h-screen bg-muted/40">
                {children}
            </div>
        </div>
    )
}
