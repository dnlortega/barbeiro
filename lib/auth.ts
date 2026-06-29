import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const salon = await prisma.salon.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!salon) return null

                const valid = await bcrypt.compare(credentials.password as string, salon.password)
                if (!valid) return null

                return {
                    id: salon.id,
                    email: salon.email,
                    name: salon.name,
                    isAdmin: salon.isAdmin,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id
                token.name = user.name
                token.isAdmin = user.isAdmin ?? false
            }
            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.isAdmin = token.isAdmin as boolean
            }
            return session
        },
    },
})
