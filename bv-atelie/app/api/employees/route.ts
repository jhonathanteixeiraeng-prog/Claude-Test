import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const employees = await prisma.employee.findMany({
    orderBy: { name: "asc" },
  })
  return NextResponse.json(employees)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await request.json()
  const { name, phone, paymentType, dailyRate } = body

  if (!name || !paymentType) {
    return NextResponse.json({ error: "Nome e tipo de pagamento são obrigatórios" }, { status: 400 })
  }
  if (paymentType === "DAILY" && !dailyRate) {
    return NextResponse.json({ error: "Valor da diária é obrigatório" }, { status: 400 })
  }

  const employee = await prisma.employee.create({
    data: { name, phone, paymentType, dailyRate: dailyRate ? parseFloat(dailyRate) : null },
  })
  return NextResponse.json(employee, { status: 201 })
}
