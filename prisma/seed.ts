import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const salons = [
    {
        name: "Barbearia Imperial",
        slug: "imperial",
        email: "imperial@barbearia.com",
        password: "123456",
        whatsapp: "11999990001",
        address: "Rua das Flores, 100 - Centro",
        barbers: ["Carlos Silva", "Rafael Souza", "Diego Oliveira", "Lucas Pereira", "André Costa"],
        services: [
            { name: "Corte Simples", price: 35, duration: 30 },
            { name: "Corte + Barba", price: 60, duration: 60 },
            { name: "Barba Completa", price: 35, duration: 30 },
            { name: "Platinado", price: 120, duration: 90 },
            { name: "Pézinho", price: 20, duration: 20 },
        ],
    },
    {
        name: "Barbearia Clássica",
        slug: "classica",
        email: "classica@barbearia.com",
        password: "123456",
        whatsapp: "11999990002",
        address: "Av. Paulista, 500 - Bela Vista",
        barbers: ["Fernando Lima", "Bruno Santos", "Henrique Rocha", "Thiago Martins", "Gabriel Ferreira"],
        services: [
            { name: "Corte Clássico", price: 40, duration: 35 },
            { name: "Corte Degradê", price: 50, duration: 40 },
            { name: "Barba a Navalha", price: 45, duration: 35 },
            { name: "Corte + Barba + Sobrancelha", price: 75, duration: 75 },
            { name: "Hidratação Capilar", price: 55, duration: 45 },
        ],
    },
    {
        name: "Barbearia Premium",
        slug: "premium",
        email: "premium@barbearia.com",
        password: "123456",
        whatsapp: "11999990003",
        address: "Rua Oscar Freire, 200 - Jardins",
        barbers: ["Ricardo Alves", "Marcelo Ribeiro", "Fábio Mendes", "Alexandre Nunes", "Pedro Carvalho"],
        services: [
            { name: "Corte Executivo", price: 65, duration: 45 },
            { name: "Barba Completa Premium", price: 55, duration: 40 },
            { name: "Pacote Completo VIP", price: 150, duration: 120 },
            { name: "Coloração", price: 130, duration: 100 },
            { name: "Sobrancelha Design", price: 30, duration: 20 },
        ],
    },
]

async function main() {
    console.log("🌱 Iniciando seed...")

    for (const salonData of salons) {
        const hash = await bcrypt.hash(salonData.password, 10)

        const salon = await prisma.salon.upsert({
            where: { slug: salonData.slug },
            update: {},
            create: {
                name: salonData.name,
                slug: salonData.slug,
                email: salonData.email,
                password: hash,
                whatsapp: salonData.whatsapp,
                address: salonData.address,
            },
        })
        console.log(`✅ Salão: ${salon.name}`)

        const createdServices: { id: string }[] = []
        for (const s of salonData.services) {
            const svc = await prisma.service.create({
                data: { ...s, salonId: salon.id },
            })
            createdServices.push({ id: svc.id })
        }

        for (const name of salonData.barbers) {
            await prisma.barber.create({
                data: {
                    salonId: salon.id,
                    name,
                    startTime: "09:00",
                    endTime: "19:00",
                    services: { connect: createdServices },
                },
            })
            console.log(`  ✂️  Barbeiro: ${name}`)
        }
    }

    console.log("\n🎉 Seed concluído!")
    console.log("\n📋 Credenciais de acesso:")
    for (const s of salons) {
        console.log(`  ${s.name}: ${s.email} / ${s.password}`)
    }
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
