"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Employee = {
  id: string
  name: string
  phone: string | null
  paymentType: string
  dailyRate: number | null
  active: boolean
}

export default function EditEmployeeForm({ employee }: { employee: Employee }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: employee.name,
    phone: employee.phone || "",
    paymentType: employee.paymentType,
    dailyRate: employee.dailyRate?.toString() || "",
    active: employee.active,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Erro ao atualizar")
      setLoading(false)
      return
    }

    router.push("/employees")
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pagamento *</label>
          <select
            value={form.paymentType}
            onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="DAILY">Diária</option>
            <option value="PRODUCTION">Produção</option>
          </select>
        </div>

        {form.paymentType === "DAILY" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Diária (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.dailyRate}
              onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="active" className="text-sm text-gray-700">Funcionário ativo</label>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <a
            href="/employees"
            className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </a>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  )
}
