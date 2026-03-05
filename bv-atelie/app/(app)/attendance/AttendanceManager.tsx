"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getDaysInMonth, getDay } from "date-fns"

type Employee = { id: string; name: string; paymentType: string; dailyRate: number | null }

type StatusKey = "PRESENT" | "HALF_DAY" | "ABSENT" | "JUSTIFIED" | "VACATION"

const STATUS_CONFIG: Record<StatusKey, { label: string; short: string; bg: string; text: string }> = {
  PRESENT:   { label: "Presente",      short: "P",  bg: "#16a34a", text: "#fff" },
  HALF_DAY:  { label: "Meio período",  short: "½",  bg: "#7c3aed", text: "#fff" },
  ABSENT:    { label: "Falta",         short: "F",  bg: "#dc2626", text: "#fff" },
  JUSTIFIED: { label: "Justificada",   short: "J",  bg: "#d97706", text: "#fff" },
  VACATION:  { label: "Férias",        short: "Fé", bg: "#0891b2", text: "#fff" },
}

const CYCLE: (StatusKey | null)[] = [null, "PRESENT", "HALF_DAY", "ABSENT", "JUSTIFIED", "VACATION"]

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f59e0b", "#22c55e", "#3b82f6", "#ef4444",
]

const DAY_ABBR = ["D", "S", "T", "Q", "Q", "S", "S"]

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export default function AttendanceManager({
  employees,
  attendanceMap: initialMap,
  month,
  year,
}: {
  employees: Employee[]
  attendanceMap: Record<string, Record<number, string>>
  month: number
  year: number
}) {
  const router = useRouter()
  const [localMap, setLocalMap] = useState(initialMap)
  const [saving, setSaving] = useState<string | null>(null)

  const daysInMonth = getDaysInMonth(new Date(year, month - 1))
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  function getDow(day: number) {
    return getDay(new Date(year, month - 1, day))
  }

  function isWeekend(day: number) {
    const d = getDow(day)
    return d === 0 || d === 6
  }

  function getStatus(employeeId: string, day: number): StatusKey | null {
    const s = localMap[employeeId]?.[day]
    if (!s) return null
    return s as StatusKey
  }

  async function cycleStatus(employeeId: string, day: number) {
    const key = `${employeeId}-${day}`
    if (saving === key) return

    const current = getStatus(employeeId, day)
    const idx = CYCLE.indexOf(current)
    const next = CYCLE[(idx + 1) % CYCLE.length]

    // Optimistic update
    setLocalMap(prev => ({
      ...prev,
      [employeeId]: { ...(prev[employeeId] ?? {}), [day]: next ?? "" },
    }))

    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSaving(key)

    if (next === null) {
      await fetch(`/api/attendance?employeeId=${employeeId}&date=${dateStr}`, {
        method: "DELETE",
      })
    } else {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, date: dateStr, status: next }),
      })
    }

    setSaving(null)
  }

  // Totals per employee
  function countStatus(employeeId: string, status: StatusKey) {
    return days.filter(d => getStatus(employeeId, d) === status).length
  }

  return (
    <div className="bg-slate-900 text-white flex flex-col" style={{ minHeight: "100%" }}>

      {/* Header */}
      <div className="px-4 md:px-6 pt-4 pb-3 border-b border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h1 className="text-lg font-bold text-white">Controle de Presença</h1>
            <p className="text-slate-400 text-xs">Gestão de frequência e faltas</p>
          </div>
          <div className="flex gap-2">
            <select
              value={month}
              onChange={e => router.push(`/attendance?month=${e.target.value}&year=${year}`)}
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={e => router.push(`/attendance?month=${month}&year=${e.target.value}`)}
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {(Object.entries(STATUS_CONFIG) as [StatusKey, typeof STATUS_CONFIG[StatusKey]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="w-5 h-5 rounded text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: cfg.bg, color: cfg.text }}
              >
                {cfg.short}
              </span>
              <span className="text-slate-400 text-xs">{cfg.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded text-xs font-bold flex items-center justify-center border border-dashed border-slate-600 text-slate-500">—</span>
            <span className="text-slate-400 text-xs">Sem registro</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      {employees.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 p-8">
          Nenhum funcionário ativo. Cadastre funcionários primeiro.
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table
            className="border-collapse"
            style={{ minWidth: `${208 + daysInMonth * 40}px`, width: "100%" }}
          >
            <thead>
              <tr className="border-b border-slate-700">
                <th className="sticky left-0 z-10 bg-slate-900 text-left px-3 py-2 text-slate-400 text-xs font-medium w-52 min-w-52">
                  FUNCIONÁRIO
                </th>
                {days.map(day => (
                  <th
                    key={day}
                    className={`text-center py-2 w-9 ${isWeekend(day) ? "bg-slate-800/60" : ""}`}
                  >
                    <div className="text-xs font-medium text-slate-500 leading-none">{DAY_ABBR[getDow(day)]}</div>
                    <div className={`text-sm font-bold leading-tight mt-0.5 ${isWeekend(day) ? "text-slate-500" : "text-white"}`}>
                      {day}
                    </div>
                  </th>
                ))}
                <th className="text-center py-2 px-2 text-slate-400 text-xs font-medium w-16 min-w-16">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => {
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                const present   = countStatus(emp.id, "PRESENT")
                const halfDay  = countStatus(emp.id, "HALF_DAY")
                const absent   = countStatus(emp.id, "ABSENT")
                const justified = countStatus(emp.id, "JUSTIFIED")

                return (
                  <tr key={emp.id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                    {/* Sticky employee column */}
                    <td className="sticky left-0 z-10 bg-slate-900 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: avatarColor }}
                        >
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate leading-tight">{emp.name}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            emp.paymentType === "DAILY"
                              ? "bg-purple-900/60 text-purple-300"
                              : "bg-blue-900/60 text-blue-300"
                          }`}>
                            {emp.paymentType === "DAILY" ? "Diária" : "Produção"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Day cells */}
                    {days.map(day => {
                      const status = getStatus(emp.id, day)
                      const cfg = status ? STATUS_CONFIG[status] : null
                      const isSavingCell = saving === `${emp.id}-${day}`
                      const weekend = isWeekend(day)

                      return (
                        <td
                          key={day}
                          className={`text-center py-1.5 px-0.5 ${weekend ? "bg-slate-800/40" : ""}`}
                        >
                          <button
                            onClick={() => cycleStatus(emp.id, day)}
                            disabled={isSavingCell}
                            title={cfg ? `${cfg.label} — clique para alterar` : "Sem registro — clique para marcar"}
                            className={`w-8 h-8 rounded text-xs font-bold transition-all mx-auto flex items-center justify-center select-none ${
                              isSavingCell ? "opacity-40" : "hover:scale-110 active:scale-95 cursor-pointer"
                            }`}
                            style={
                              cfg
                                ? { backgroundColor: cfg.bg, color: cfg.text }
                                : {
                                    backgroundColor: "transparent",
                                    color: "#475569",
                                    border: "1px dashed #334155",
                                  }
                            }
                          >
                            {isSavingCell ? (
                              <span className="animate-pulse text-base leading-none">·</span>
                            ) : cfg ? (
                              cfg.short
                            ) : (
                              "—"
                            )}
                          </button>
                        </td>
                      )
                    })}

                    {/* Totals */}
                    <td className="text-center py-2 px-2">
                      <div className="text-xs leading-tight space-y-0.5">
                        <div className="text-green-400 font-medium">{present}P</div>
                        {halfDay > 0 && <div className="text-purple-400">{halfDay}½</div>}
                        {absent > 0 && <div className="text-red-400">{absent}F</div>}
                        {justified > 0 && <div className="text-amber-400">{justified}J</div>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
