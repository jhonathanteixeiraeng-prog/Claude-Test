import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { name, pricePerUnit, active } = body

  const serviceType = await prisma.serviceType.update({
    where: { id },
    data: { name, pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined, active },
  })
  return NextResponse.json(serviceType)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.serviceType.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ success: true })
}
