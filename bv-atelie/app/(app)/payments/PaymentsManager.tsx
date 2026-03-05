"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type Employee = { id: string; name: string; paymentType: string }
type Payment = {
  id: string
  employee: Employee
  startDate: string | Date
  endDate: string | Date
  totalAmount: number
  status: string
  paidAt: string | Date | null
  note: string | null
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(d: string | Date) {
  return format(new Date(d), "dd/MM/yyyy", { locale: ptBR })
}

export default function PaymentsManager({
  employees,
  initialPayments,
}: {
  employees: Employee[]
  initialPayments: Payment[]
}) {
  const router = useRouter()
  const [payments, setPayments] = useState(initialPayments)
  const [form, setForm] = useState({
    employeeId: employees[0]?.id || "",
    startDate: "",
    endDate: "",
    note: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [preview, setPreview] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  async function calculatePreview() {
    if (!form.employeeId || !form.startDate || !form.endDate) return
    setCalculating(true)
    // Call a temp fetch to preview
    const res = await fetch(
      `/api/payments?employeeId=${form.employeeId}&_preview=1`,
    )
    // We'll just show the amount after creation
    setCalculating(false)
    setPreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
      return
    }

    const newPayment = await res.json()
    setPayments([newPayment, ...payments])
    setForm({ ...form, startDate: "", endDate: "", note: "" })
    setPreview(null)
    setLoading(false)
    router.refresh()
  }

  async function handleMarkPaid(id: string) {
    const res = await fetch(`/api/payments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPayments(payments.map((p) => (p.id === id ? updated : p)))
    }
    router.refresh()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/payments/${id}`, { method: "DELETE" })
    setPayments(payments.filter((p) => p.id !== id))
    router.refresh()
  }

  const filteredPayments =
    filterStatus === "ALL" ? payments : payments.filter((p) => p.status === filterStatus)

  const pendingTotal = payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.totalAmount, 0)

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Total Pendente</p>
          <p className="text-xl font-bold text-orange-500 mt-1">{formatCurrency(pendingTotal)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Fechamentos Pendentes</p>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {payments.filter((p) => p.status === "PENDING").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Pagos</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            {payments.filter((p) => p.status === "PAID").length}
          </p>
        </div>
      </div>

      {/* Create payment */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Fechar Pagamento por Período</h2>
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
                  {emp.name} ({emp.paymentType === "DAILY" ? "Diária" : "Produção"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Ex: Quinzena de fevereiro"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data Inicial *</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data Final *</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
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
              {loading ? "Calculando..." : "Fechar Pagamento"}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              O sistema calcula automaticamente: dias presentes × diária (ou) peças × valor por peça
            </p>
          </div>
        </form>
      </div>

      {/* Payments list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-gray-700 text-sm mr-auto">Histórico de Pagamentos</h2>
          <div className="flex gap-2 flex-wrap">
            {["ALL", "PENDING", "PAID"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  filterStatus === s
                    ? "bg-purple-600 text-white border-purple-600"
                    : "text-gray-500 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {s === "ALL" ? "Todos" : s === "PENDING" ? "Pendentes" : "Pagos"}
              </button>
            ))}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Nenhum pagamento encontrado</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredPayments.map((p) => (
              <div key={p.id} className="px-4 py-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-gray-800">{p.employee.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          p.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {p.status === "PAID" ? "Pago" : "Pendente"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(p.startDate)} – {formatDate(p.endDate)}
                    </p>
                    {p.note && <p className="text-xs text-gray-400">{p.note}</p>}
                    {p.status === "PAID" && p.paidAt && (
                      <p className="text-xs text-green-600">Pago em {formatDate(p.paidAt)}</p>
                    )}
                  </div>
                  <p className="font-bold text-gray-800 text-lg whitespace-nowrap">{formatCurrency(p.totalAmount)}</p>
                </div>
                <div className="flex gap-2">
                  {p.status === "PENDING" && (
                    <button
                      onClick={() => handleMarkPaid(p.id)}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"
                    >
                      Marcar como Pago
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5"
                  >
                    Excluir
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
