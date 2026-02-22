import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  const employeeId = searchParams.get("employeeId")

  const where: Record<string, unknown> = {}
  if (date) {
    const start = new Date(date)
    start.setUTCHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setUTCHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  }
  if (employeeId) where.employeeId = employeeId

  const attendances = await prisma.attendance.findMany({
    where,
    include: { employee: true },
    orderBy: { date: "desc" },
  })
  return NextResponse.json(attendances)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await request.json()
  const { employeeId, date, status, note } = body

  if (!employeeId || !date || !status) {
    return NextResponse.json({ error: "Funcionário, data e status são obrigatórios" }, { status: 400 })
  }

  const attendanceDate = new Date(date)
  attendanceDate.setUTCHours(12, 0, 0, 0)

  const attendance = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId, date: attendanceDate } },
    update: { status, note },
    create: { employeeId, date: attendanceDate, status, note },
  })
  return NextResponse.json(attendance, { status: 201 })
}
