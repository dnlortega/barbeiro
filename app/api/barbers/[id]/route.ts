import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const barber = await prisma.barber.findUnique({ where: { id }, select: { salonId: true } })
    if (!barber) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    if (barber.salonId !== session.user.id) return NextResponse.json({ error: "Proibido" }, { status: 403 })

    const allowed = ["commission", "monthlyGoal", "bio", "isActive"]
    const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

    await prisma.barber.update({ where: { id }, data })
    return NextResponse.json({ success: true })
}
