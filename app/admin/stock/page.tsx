export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { StockView } from "@/components/admin/stock-view"

export default async function StockPage() {
    const session = await auth()
    const salonId = session?.user?.id ?? ""
    const isAdmin = session?.user?.isAdmin ?? false

    if (isAdmin) {
        return (
            <div className="p-4 md:p-8">
                <p className="text-muted-foreground">Estoque disponível por salão individualmente.</p>
            </div>
        )
    }

    const items = await prisma.stockItem.findMany({
        where: { salonId },
        include: {
            transactions: { orderBy: { createdAt: "desc" }, take: 10 },
        },
        orderBy: { name: "asc" },
    })

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
                <p className="text-muted-foreground text-sm">
                    Controle de produtos e materiais do salão.
                </p>
            </div>
            <StockView items={items} />
        </div>
    )
}
