export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { BlacklistManager } from "@/components/admin/blacklist-manager"

export default async function BlacklistPage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""

    const blacklist = await prisma.blacklistedPhone.findMany({
        where: { salonId },
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Lista Negra</h1>
                <p className="text-muted-foreground text-sm">
                    Telefones bloqueados de fazer agendamentos online.
                </p>
            </div>
            <BlacklistManager initialList={blacklist} />
        </div>
    )
}
