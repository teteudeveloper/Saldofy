import { PrismaClient, TenantType, TransactionType, UserRole } from "@prisma/client"
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@saldofy.com' },
    update: {},
    create: {
      email: 'demo@saldofy.com',
      password: hashedPassword,
      name: 'Demo User',
      emailVerified: true,
    },
  })

  console.log('✅ User created:', user.email)

  const personalTenant = await prisma.tenant.create({
    data: {
      name: 'Finanças Pessoais',
      type: TenantType.PERSONAL,
      tenantUsers: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  })

  console.log('✅ Personal tenant created')

  const businessTenant = await prisma.tenant.create({
    data: {
      name: 'Minha Empresa',
      type: TenantType.BUSINESS,
      tenantUsers: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  })

  console.log('✅ Business tenant created')

  const personalCategories = await prisma.category.createMany({
    data: [
      { name: 'Salário', type: TransactionType.INCOME, color: '#10b981', tenantId: personalTenant.id },
      { name: 'Freelance', type: TransactionType.INCOME, color: '#3b82f6', tenantId: personalTenant.id },
      { name: 'Alimentação', type: TransactionType.EXPENSE, color: '#ef4444', tenantId: personalTenant.id },
      { name: 'Transporte', type: TransactionType.EXPENSE, color: '#f59e0b', tenantId: personalTenant.id },
      { name: 'Moradia', type: TransactionType.EXPENSE, color: '#8b5cf6', tenantId: personalTenant.id },
      { name: 'Lazer', type: TransactionType.EXPENSE, color: '#ec4899', tenantId: personalTenant.id },
    ],
  })

  console.log('✅ Personal categories created')

  const businessCategories = await prisma.category.createMany({
    data: [
      { name: 'Vendas', type: TransactionType.INCOME, color: '#10b981', tenantId: businessTenant.id },
      { name: 'Serviços', type: TransactionType.INCOME, color: '#3b82f6', tenantId: businessTenant.id },
      { name: 'Salários', type: TransactionType.EXPENSE, color: '#ef4444', tenantId: businessTenant.id },
      { name: 'Fornecedores', type: TransactionType.EXPENSE, color: '#f59e0b', tenantId: businessTenant.id },
      { name: 'Marketing', type: TransactionType.EXPENSE, color: '#8b5cf6', tenantId: businessTenant.id },
      { name: 'Infraestrutura', type: TransactionType.EXPENSE, color: '#06b6d4', tenantId: businessTenant.id },
    ],
  })

  console.log('✅ Business categories created')

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })