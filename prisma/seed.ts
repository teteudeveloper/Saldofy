import { PrismaClient, TenantType, TransactionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  await prisma.transaction.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.revenue.deleteMany()
  await prisma.tax.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.company.deleteMany()
  await prisma.category.deleteMany()
  await prisma.tenantUser.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user1 = await prisma.user.create({
    data: {
      email: 'pessoal@saldofy.com',
      password: hashedPassword,
      name: 'João Silva',
      emailVerified: true,
    },
  })

  console.log('✅ User 1 (Personal) created:', user1.email)

  const user2 = await prisma.user.create({
    data: {
      email: 'empresarial@saldofy.com',
      password: hashedPassword,
      name: 'Maria Santos',
      emailVerified: true,
    },
  })

  console.log('✅ User 2 (Business) created:', user2.email)

  const personalTenant = await prisma.tenant.create({
    data: {
      name: 'Finanças Pessoais',
      type: TenantType.PERSONAL,
      tenantUsers: {
        create: {
          userId: user1.id,
          role: 'OWNER',
        },
      },
      categories: {
        createMany: {
          data: [
            { name: 'Salário', type: TransactionType.INCOME, color: '#10b981' },
            { name: 'Freelance', type: TransactionType.INCOME, color: '#3b82f6' },
            { name: 'Investimentos', type: TransactionType.INCOME, color: '#8b5cf6' },
            { name: 'Outro', type: TransactionType.INCOME, color: '#64748b' },
          ],
        },
      },
    },
    include: {
      categories: true,
    },
  })

  console.log('✅ Personal tenant created')

  const incomeCategory = personalTenant.categories.find(c => c.name === 'Salário')

  if (incomeCategory) {
    await prisma.transaction.createMany({
      data: [
        {
          description: 'Salário Mensal',
          amount: 5000,
          type: TransactionType.INCOME,
          date: new Date(),
          categoryId: incomeCategory.id,
          tenantId: personalTenant.id,
          userId: user1.id,
        },
      ],
    })
    console.log('✅ Sample personal transactions created')
  }

  await prisma.goal.create({
    data: {
      name: 'Viagem para Europa',
      targetAmount: 15000,
      currentAmount: 5000,
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), 
      tenantId: personalTenant.id,
      userId: user1.id,
    },
  })

  console.log('✅ Sample goal created')

  const businessTenant = await prisma.tenant.create({
    data: {
      name: 'Finanças Empresariais',
      type: TenantType.BUSINESS,
      tenantUsers: {
        create: {
          userId: user2.id,
          role: 'OWNER',
        },
      },
      categories: {
        createMany: {
          data: [
            { name: 'Vendas', type: TransactionType.INCOME, color: '#10b981' },
            { name: 'Serviços', type: TransactionType.INCOME, color: '#3b82f6' },
            { name: 'Salários', type: TransactionType.EXPENSE, color: '#ef4444' },
            { name: 'Fornecedores', type: TransactionType.EXPENSE, color: '#f59e0b' },
            { name: 'Marketing', type: TransactionType.EXPENSE, color: '#8b5cf6' },
            { name: 'Infraestrutura', type: TransactionType.EXPENSE, color: '#06b6d4' },
          ],
        },
      },
    },
    include: {
      categories: true,
    },
  })

  console.log('✅ Business tenant created')

  const company = await prisma.company.create({
    data: {
      name: 'Tech Solutions Ltda',
      cnpj: '12.345.678/0001-90',
      tenantId: businessTenant.id,
    },
  })

  console.log('✅ Sample company created')

  const employee1 = await prisma.employee.create({
    data: {
      name: 'Pedro Costa',
      email: 'pedro@techsolutions.com',
      position: 'Desenvolvedor',
      companyId: company.id,
    },
  })

  const employee2 = await prisma.employee.create({
    data: {
      name: 'Ana Oliveira',
      email: 'ana@techsolutions.com',
      position: 'Designer',
      companyId: company.id,
    },
  })

  console.log('✅ Sample employees created')

  await prisma.revenue.createMany({
    data: [
      {
        description: 'Projeto Website Cliente A',
        amount: 25000,
        date: new Date(),
        companyId: company.id,
      },
      {
        description: 'Consultoria Cliente B',
        amount: 15000,
        date: new Date(),
        companyId: company.id,
      },
    ],
  })

  console.log('✅ Sample revenues created')

  const salaryCategory = businessTenant.categories.find(c => c.name === 'Salários')

  if (salaryCategory) {
    await prisma.transaction.createMany({
      data: [
        {
          description: 'Salário Pedro',
          amount: 8000,
          type: TransactionType.EXPENSE,
          date: new Date(),
          categoryId: salaryCategory.id,
          tenantId: businessTenant.id,
          userId: user2.id,
          companyId: company.id,
          employeeId: employee1.id,
        },
        {
          description: 'Salário Ana',
          amount: 7000,
          type: TransactionType.EXPENSE,
          date: new Date(),
          categoryId: salaryCategory.id,
          tenantId: businessTenant.id,
          userId: user2.id,
          companyId: company.id,
          employeeId: employee2.id,
        },
      ],
    })
    console.log('✅ Sample expenses created')
  }

  await prisma.tax.createMany({
    data: [
      {
        name: 'DARF - ISS',
        amount: 2500,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 
        paid: false,
        companyId: company.id,
      },
      {
        name: 'INSS',
        amount: 3200,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), 
        paid: false,
        companyId: company.id,
      },
      {
        name: 'DAS - Simples Nacional',
        amount: 1800,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
        paid: true,
        paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        companyId: company.id,
      },
    ],
  })

  console.log('✅ Sample taxes created')

  console.log('\n🎉 Seed completed!\n')
  console.log('📧 Login credentials:')
  console.log('───────────────────────────────')
  console.log('PERSONAL FINANCE:')
  console.log('Email: pessoal@saldofy.com')
  console.log('Senha: demo123')
  console.log('───────────────────────────────')
  console.log('BUSINESS FINANCE:')
  console.log('Email: empresarial@saldofy.com')
  console.log('Senha: demo123')
  console.log('───────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
