import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  const employeeId = searchParams.get("employeeId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  const where: Record<string, unknown> = {}
  if (employeeId) where.employeeId = employeeId

  if (date) {
    const start = new Date(date)
    start.setUTCHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setUTCHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  } else if (startDate && endDate) {
    const start = new Date(startDate)
    start.setUTCHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setUTCHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  }

  const records = await prisma.productionRecord.findMany({
    where,
    include: { employee: true, serviceType: true },
    orderBy: { date: "desc" },
  })
  return NextResponse.json(records)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await request.json()
  const { employeeId, serviceTypeId, date, quantity, note } = body

  if (!employeeId || !serviceTypeId || !date || !quantity) {
    return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
  }

  const serviceType = await prisma.serviceType.findUnique({ where: { id: serviceTypeId } })
  if (!serviceType) return NextResponse.json({ error: "Tipo de serviço não encontrado" }, { status: 404 })

  const recordDate = new Date(date)
  recordDate.setUTCHours(12, 0, 0, 0)

  const record = await prisma.productionRecord.create({
    data: {
      employeeId,
      serviceTypeId,
      date: recordDate,
      quantity: parseInt(quantity),
      unitPrice: serviceType.pricePerUnit,
      note,
    },
    include: { employee: true, serviceType: true },
  })
  return NextResponse.json(record, { status: 201 })
}
