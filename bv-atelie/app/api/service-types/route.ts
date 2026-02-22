import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const serviceTypes = await prisma.serviceType.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(serviceTypes)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await request.json()
  const { name, pricePerUnit } = body

  if (!name || !pricePerUnit) {
    return NextResponse.json({ error: "Nome e valor por peça são obrigatórios" }, { status: 400 })
  }

  const serviceType = await prisma.serviceType.create({
    data: { name, pricePerUnit: parseFloat(pricePerUnit) },
  })
  return NextResponse.json(serviceType, { status: 201 })
}
