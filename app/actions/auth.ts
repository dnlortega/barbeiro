import { prisma } from "@/lib/prisma"

export async function getLoginCredentials() {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: ["ADMIN", "BARBER"]
                }
            },
            select: {
                email: true,
                role: true,
                name: true
            }
        })
        return users
    } catch (error) {
        console.error("Error fetching credentials:", error)
        return []
    }
}
