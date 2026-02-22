"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type Employee = { id: string; name: string; paymentType: string }
type AttendanceRecord = { id: string; employeeId: string; status: string; note?: string | null }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PRESENT: { label: "Presente", color: "bg-green-100 text-green-700 border-green-300" },
  ABSENT: { label: "Ausente", color: "bg-red-100 text-red-700 border-red-300" },
  HALF_DAY: { label: "Meio Período", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
}

export default function AttendanceManager({
  employees,
  attendanceMap,
  selectedDate,
}: {
  employees: Employee[]
  attendanceMap: Record<string, AttendanceRecord>
  selectedDate: string
}) {
  const router = useRouter()
  const [localMap, setLocalMap] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(attendanceMap).map(([k, v]) => [k, v.status]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [date, setDate] = useState(selectedDate)

  const dateLabel = format(new Date(date + "T12:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })

  async function markAttendance(employeeId: string, status: string) {
    setSaving(employeeId)
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, date, status }),
    })
    if (res.ok) {
      setLocalMap({ ...localMap, [employeeId]: status })
    }
    setSaving(null)
  }

  function handleDateChange(newDate: string) {
    setDate(newDate)
    router.push(`/attendance?date=${newDate}`)
  }

  const presentCount = Object.values(localMap).filter((s) => s === "PRESENT").length
  const absentCount = Object.values(localMap).filter((s) => s === "ABSENT").length
  const halfDayCount = Object.values(localMap).filter((s) => s === "HALF_DAY").length

  return (
    <div className="space-y-4">
      {/* Date picker */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-gray-800 capitalize">{dateLabel}</p>
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              <span className="text-green-600 font-medium">✓ {presentCount} presentes</span>
              <span className="text-yellow-600 font-medium">½ {halfDayCount} meio período</span>
              <span className="text-red-500 font-medium">✗ {absentCount} ausentes</span>
            </div>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Attendance grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {employees.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>Nenhum funcionário ativo. Cadastre funcionários primeiro.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {employees.map((emp) => {
              const currentStatus = localMap[emp.id]
              const isSaving = saving === emp.id

              return (
                <div key={emp.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{emp.name}</p>
                    <p className="text-xs text-gray-400">
                      {emp.paymentType === "DAILY" ? "Diária" : "Produção"}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap justify-end">
                    {(["PRESENT", "HALF_DAY", "ABSENT"] as const).map((status) => {
                      const cfg = STATUS_LABELS[status]
                      const isSelected = currentStatus === status
                      return (
                        <button
                          key={status}
                          onClick={() => markAttendance(emp.id, status)}
                          disabled={isSaving}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                            isSelected
                              ? cfg.color + " border-2 shadow-sm"
                              : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                          } disabled:opacity-50`}
                        >
                          {isSaving && isSelected ? "..." : cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
