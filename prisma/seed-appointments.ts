import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const CUSTOMERS = [
    { name: "João Silva",      phone: "11991110001" },
    { name: "Pedro Oliveira",  phone: "11992220002" },
    { name: "Carlos Ferreira", phone: "11993330003" },
    { name: "Ricardo Lima",    phone: "11994440004" },
    { name: "Bruno Alves",     phone: "11995550005" },
    { name: "Gabriel Martins", phone: "11996660006" },
    { name: "Thiago Pereira",  phone: "11997770007" },
    { name: "Felipe Carvalho", phone: "11998880008" },
    { name: "Lucas Mendes",    phone: "11999990009" },
    { name: "Rafael Barbosa",  phone: "11990000010" },
    { name: "Diego Araújo",    phone: "11911110011" },
    { name: "Henrique Dias",   phone: "11922220012" },
    { name: "Marcelo Souza",   phone: "11933330013" },
    { name: "André Nunes",     phone: "11944440014" },
    { name: "Eduardo Santos",  phone: "11955550015" },
    { name: "Rodrigo Gomes",   phone: "11966660016" },
    { name: "Fábio Castro",    phone: "11977770017" },
    { name: "Alexandre Costa", phone: "11988880018" },
    { name: "Danilo Rocha",    phone: "11900000019" },
    { name: "Samuel Lopes",    phone: "11911110020" },
]

// June 28 = Dom (yesterday), June 29 = Seg (today), ...July 4 = Sab
const DAYS = [
    { offset: -1, label: "28/06 Dom" },
    { offset: 0,  label: "29/06 Seg" },
    { offset: 1,  label: "30/06 Ter" },
    { offset: 2,  label: "01/07 Qua" },
    { offset: 3,  label: "02/07 Qui" },
    { offset: 4,  label: "03/07 Sex" },
    { offset: 5,  label: "04/07 Sab" },
]

const MORNING_SLOTS  = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
const AFTERNOON_SLOTS = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"]

function getDate(dayOffset: number, timeStr: string): Date {
    const base = new Date()
    base.setDate(base.getDate() + dayOffset)
    const [h, m] = timeStr.split(":").map(Number)
    base.setHours(h, m, 0, 0)
    return base
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function statusForDay(dayOffset: number): string {
    if (dayOffset < 0) return pick(["COMPLETED", "COMPLETED", "COMPLETED", "NO_SHOW"])
    if (dayOffset === 0) return pick(["COMPLETED", "CONFIRMED", "PENDING", "CONFIRMED"])
    return pick(["PENDING", "PENDING", "CONFIRMED", "CONFIRMED"])
}

async function main() {
    console.log("🗓️  Gerando agendamentos para semana de 28/06 – 04/07...\n")

    const salons = await prisma.salon.findMany({
        where: { isAdmin: false },
        include: {
            barbers: true,
            services: true,
        },
    })

    let total = 0

    for (const salon of salons) {
        if (salon.barbers.length === 0 || salon.services.length === 0) {
            console.log(`⚠️  ${salon.name}: sem barbeiros ou serviços, pulando.`)
            continue
        }

        console.log(`\n📍 ${salon.name}`)
        let count = 0

        for (const day of DAYS) {
            // dom = sem agendamentos (closedDay) — pula domingo
            if (day.offset === -1) {
                // sábado do passado – cria alguns concluídos
                const slots = pick([MORNING_SLOTS, AFTERNOON_SLOTS])
                const daySlots = [...slots].sort(() => 0.5 - Math.random()).slice(0, 3)
                for (const slot of daySlots) {
                    const barber = pick(salon.barbers)
                    const service = pick(salon.services)
                    const customer = pick(CUSTOMERS)
                    await prisma.appointment.create({
                        data: {
                            salonId: salon.id,
                            barberId: barber.id,
                            serviceId: service.id,
                            customerName: customer.name,
                            customerPhone: customer.phone,
                            date: getDate(day.offset, slot),
                            status: "COMPLETED",
                        },
                    })
                    count++
                }
                continue
            }

            // Determina quantos slots usar no dia
            const morningPicks = [...MORNING_SLOTS].sort(() => 0.5 - Math.random()).slice(0, 3)
            const afternoonPicks = [...AFTERNOON_SLOTS].sort(() => 0.5 - Math.random()).slice(0, 4)
            const allSlots = [...morningPicks, ...afternoonPicks]

            // Distribui entre barbeiros (cada barbeiro pega alguns slots)
            for (const slot of allSlots) {
                const barber = pick(salon.barbers)
                const service = pick(salon.services)
                const customer = pick(CUSTOMERS)
                const status = statusForDay(day.offset)

                await prisma.appointment.create({
                    data: {
                        salonId: salon.id,
                        barberId: barber.id,
                        serviceId: service.id,
                        customerName: customer.name,
                        customerPhone: customer.phone,
                        date: getDate(day.offset, slot),
                        status,
                    },
                })
                count++
            }

            console.log(`  ${day.label}: ${allSlots.length} agendamentos`)
        }

        total += count
        console.log(`  ✅ ${count} agendamentos criados`)
    }

    console.log(`\n🎉 Total: ${total} agendamentos gerados!`)
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
