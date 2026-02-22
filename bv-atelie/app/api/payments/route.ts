import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get("employeeId")
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (employeeId) where.employeeId = employeeId
  if (status) where.status = status

  const payments = await prisma.payment.findMany({
    where,
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(payments)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await request.json()
  const { employeeId, startDate, endDate, note } = body

  if (!employeeId || !startDate || !endDate) {
    return NextResponse.json({ error: "Funcionário, data inicial e final são obrigatórios" }, { status: 400 })
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 })

  const start = new Date(startDate)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setUTCHours(23, 59, 59, 999)

  let totalAmount = 0

  if (employee.paymentType === "DAILY") {
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: { gte: start, lte: end },
        status: { in: ["PRESENT", "HALF_DAY"] },
      },
    })
    totalAmount = attendances.reduce((sum, a) => {
      return sum + (a.status === "HALF_DAY" ? (employee.dailyRate || 0) * 0.5 : (employee.dailyRate || 0))
    }, 0)
  } else {
    const productions = await prisma.productionRecord.findMany({
      where: { employeeId, date: { gte: start, lte: end } },
    })
    totalAmount = productions.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0)
  }

  const payment = await prisma.payment.create({
    data: {
      employeeId,
      startDate: start,
      endDate: end,
      totalAmount,
      note,
    },
    include: { employee: true },
  })
  return NextResponse.json(payment, { status: 201 })
}
