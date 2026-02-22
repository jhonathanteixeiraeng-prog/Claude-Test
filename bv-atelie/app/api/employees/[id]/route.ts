import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const employee = await prisma.employee.findUnique({ where: { id } })
  if (!employee) return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 })
  return NextResponse.json(employee)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { name, phone, paymentType, dailyRate, active } = body

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      name,
      phone,
      paymentType,
      dailyRate: dailyRate ? parseFloat(dailyRate) : null,
      active,
    },
  })
  return NextResponse.json(employee)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.employee.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ success: true })
}
