import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setUTCHours(23, 59, 59, 999)

  const [
    totalEmployees,
    presentToday,
    absentToday,
    pendingPayments,
    recentProduction,
  ] = await Promise.all([
    prisma.employee.count({ where: { active: true } }),
    prisma.attendance.count({
      where: { date: { gte: today, lte: todayEnd }, status: "PRESENT" },
    }),
    prisma.attendance.count({
      where: { date: { gte: today, lte: todayEnd }, status: "ABSENT" },
    }),
    prisma.payment.findMany({
      where: { status: "PENDING" },
      include: { employee: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.productionRecord.findMany({
      where: { date: { gte: today, lte: todayEnd } },
      include: { employee: true, serviceType: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const pendingTotal = pendingPayments.reduce((sum, p) => sum + p.totalAmount, 0)

  return NextResponse.json({
    totalEmployees,
    presentToday,
    absentToday,
    pendingPaymentsCount: pendingPayments.length,
    pendingTotal,
    pendingPayments,
    recentProduction,
  })
}
