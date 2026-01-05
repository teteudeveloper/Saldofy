import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get("companyId")
    const month = parseInt(searchParams.get("month") || "0")
    const year = parseInt(searchParams.get("year") || "0")

    if (!companyId || !month || !year) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const taxes = await prisma.tax.findMany({
      where: {
        companyId,
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    })

    return NextResponse.json({ taxes })
  } catch (error) {
    console.error("GET /api/taxes error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}