"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type Employee = { id: string; name: string }
type ServiceType = { id: string; name: string; pricePerUnit: number }
type ProductionRecord = {
  id: string
  employee: Employee
  serviceType: ServiceType
  quantity: number
  unitPrice: number
  note: string | null
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function ProductionManager({
  employees,
  serviceTypes,
  initialRecords,
  selectedDate,
}: {
  employees: Employee[]
  serviceTypes: ServiceType[]
  initialRecords: ProductionRecord[]
  selectedDate: string
}) {
  const router = useRouter()
  const [records, setRecords] = useState(initialRecords)
  const [date, setDate] = useState(selectedDate)
  const [form, setForm] = useState({
    employeeId: employees[0]?.id || "",
    serviceTypeId: serviceTypes[0]?.id || "",
    quantity: "",
    note: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const dateLabel = format(new Date(date + "T12:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })
  const totalToday = records.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0)

  function handleDateChange(newDate: string) {
    setDate(newDate)
    router.push(`/production?date=${newDate}`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, date }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    const newRecord = await res.json()
    setRecords([newRecord, ...records])
    setForm({ ...form, quantity: "", note: "" })
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/production/${id}`, { method: "DELETE" })
    setRecords(records.filter((r) => r.id !== id))
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Date + total */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-semibold text-gray-800 capitalize">{dateLabel}</p>
          <p className="text-sm text-purple-600 font-medium mt-0.5">
            Total do dia: {formatCurrency(totalToday)}
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Add record form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Registrar Produção</h2>

        {employees.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Nenhum funcionário de produção ativo. Cadastre funcionários com tipo &quot;Produção&quot; primeiro.
          </p>
        ) : serviceTypes.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Nenhum tipo de serviço cadastrado.{" "}
            <a href="/service-types" className="text-purple-600 hover:underline">
              Cadastre um tipo de serviço
            </a>{" "}
            primeiro.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Funcionário *</label>
              <select
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Serviço *</label>
              <select
                value={form.serviceTypeId}
                onChange={(e) => setForm({ ...form, serviceTypeId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {serviceTypes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} — {formatCurrency(st.pricePerUnit)}/pç
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade de Peças *</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Opcional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {error && (
              <div className="col-span-2">
                <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              </div>
            )}

            <div className="col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Registrando..." : "Registrar Produção"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Records list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-700 text-sm">
            Registros do Dia ({records.length})
          </h2>
        </div>
        {records.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Nenhum registro para este dia</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{r.employee.name}</p>
                  <p className="text-xs text-gray-500">
                    {r.serviceType.name} · {r.quantity} peças ×{" "}
                    {formatCurrency(r.unitPrice)}/pç
                  </p>
                  {r.note && <p className="text-xs text-gray-400 mt-0.5">{r.note}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">
                    {formatCurrency(r.quantity * r.unitPrice)}
                  </p>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-xs text-red-400 hover:text-red-600 mt-0.5"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
