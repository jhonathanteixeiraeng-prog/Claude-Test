import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({ select: { email: true, name: true } })
    return NextResponse.json({
      ok: true,
      userCount,
      users,
      databaseUrl: process.env.DATABASE_URL ? "SET" : "NOT SET",
      authSecret: process.env.AUTH_SECRET ? "SET" : "NOT SET",
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: String(error),
      databaseUrl: process.env.DATABASE_URL ? "SET" : "NOT SET",
      authSecret: process.env.AUTH_SECRET ? "SET" : "NOT SET",
    }, { status: 500 })
  }
}
