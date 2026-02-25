import { prisma } from "@/lib/prisma"
import AttendanceManager from "./AttendanceManager"

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1
  const year  = params.year  ? parseInt(params.year)  : now.getFullYear()

  const monthStart = new Date(Date.UTC(year, month - 1, 1,  0,  0,  0))
  const monthEnd   = new Date(Date.UTC(year, month,     0, 23, 59, 59, 999))

  const [employees, attendances] = await Promise.all([
    prisma.employee.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
    }),
  ])

  // { [employeeId]: { [day: number]: status } }
  const attendanceMap: Record<string, Record<number, string>> = {}
  for (const a of attendances) {
    if (!attendanceMap[a.employeeId]) attendanceMap[a.employeeId] = {}
    attendanceMap[a.employeeId][new Date(a.date).getUTCDate()] = a.status
  }

  return (
    <AttendanceManager
      employees={employees}
      attendanceMap={attendanceMap}
      month={month}
      year={year}
    />
  )
}
