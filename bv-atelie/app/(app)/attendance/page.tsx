import { prisma } from "@/lib/prisma"
import AttendanceManager from "./AttendanceManager"
import { format } from "date-fns"

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const dateStr = params.date || format(new Date(), "yyyy-MM-dd")

  const dateObj = new Date(dateStr)
  dateObj.setUTCHours(0, 0, 0, 0)
  const dateEnd = new Date(dateStr)
  dateEnd.setUTCHours(23, 59, 59, 999)

  const [employees, attendances] = await Promise.all([
    prisma.employee.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: dateObj, lte: dateEnd } },
    }),
  ])

  const attendanceMap = Object.fromEntries(attendances.map((a) => [a.employeeId, a]))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Registro de Presença</h1>
        <p className="text-gray-500 text-sm">Marque a presença dos funcionários por dia</p>
      </div>
      <AttendanceManager
        employees={employees}
        attendanceMap={attendanceMap}
        selectedDate={dateStr}
      />
    </div>
  )
}
