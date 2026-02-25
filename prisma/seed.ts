import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...')

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@barbeiro.com' },
        update: {},
        create: {
            email: 'admin@barbeiro.com',
            name: 'Administrador',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log('✅ Usuário admin criado:', admin.email)
    console.log('📧 Email: admin@barbeiro.com')
    console.log('🔑 Senha: admin123')

    // Criar alguns serviços de exemplo
    const services = [
        { name: 'Corte Simples', price: 30, duration: 30 },
        { name: 'Corte + Barba', price: 50, duration: 45 },
        { name: 'Barba', price: 25, duration: 20 },
        { name: 'Corte Premium', price: 60, duration: 60 },
        { name: 'Hidratação Capilar', price: 40, duration: 40 },
    ]

    for (const service of services) {
        await prisma.service.upsert({
            where: { id: service.name },
            update: {},
            create: service,
        })
    }

    console.log('✅ Serviços criados')

    // Criar um barbeiro de exemplo
    const barberPassword = await bcrypt.hash('barbeiro123', 10)

    const barber = await prisma.user.upsert({
        where: { email: 'barbeiro@barbeiro.com' },
        update: {},
        create: {
            email: 'barbeiro@barbeiro.com',
            name: 'João Silva',
            password: barberPassword,
            role: 'BARBER',
            startTime: '08:00',
            endTime: '18:00',
        },
    })

    console.log('✅ Barbeiro criado:', barber.email)
    console.log('📧 Email: barbeiro@barbeiro.com')
    console.log('🔑 Senha: barbeiro123')
}

main()
    .catch((e) => {
        console.error('❌ Erro ao executar seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
