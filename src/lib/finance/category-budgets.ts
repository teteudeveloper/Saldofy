import { prisma } from "@/lib/prisma"

export async function ensureCategoryBudgetsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS category_budgets (
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      monthly_limit DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (tenant_id, category_id)
    );
  `)
}

export async function upsertCategoryBudget(params: {
  tenantId: string
  categoryId: string
  monthlyLimit: number
}) {
  await ensureCategoryBudgetsTable()
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO category_budgets (tenant_id, category_id, monthly_limit)
      VALUES ($1, $2, $3)
      ON CONFLICT (tenant_id, category_id)
      DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit, updated_at = NOW();
    `,
    params.tenantId,
    params.categoryId,
    params.monthlyLimit
  )
}

export async function deleteCategoryBudget(params: { tenantId: string; categoryId: string }) {
  await ensureCategoryBudgetsTable()
  await prisma.$executeRawUnsafe(
    `DELETE FROM category_budgets WHERE tenant_id = $1 AND category_id = $2;`,
    params.tenantId,
    params.categoryId
  )
}

export async function getBudgetsByCategoryId(tenantId: string) {
  await ensureCategoryBudgetsTable()
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT category_id, monthly_limit FROM category_budgets WHERE tenant_id = $1;`,
    tenantId
  )) as { category_id: string; monthly_limit: number }[]

  const map = new Map<string, number>()
  for (const row of rows) {
    map.set(row.category_id, Number(row.monthly_limit))
  }
  return map
}

export async function getBudgetForCategory(params: { tenantId: string; categoryId: string }) {
  await ensureCategoryBudgetsTable()
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT monthly_limit FROM category_budgets WHERE tenant_id = $1 AND category_id = $2 LIMIT 1;`,
    params.tenantId,
    params.categoryId
  )) as { monthly_limit: number }[]

  if (!rows[0]) return null
  return Number(rows[0].monthly_limit)
}

