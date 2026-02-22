"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewEmployeePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    phone: "",
    paymentType: "DAILY",
    dailyRate: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Erro ao cadastrar funcionário")
      setLoading(false)
      return
    }

    router.push("/employees")
    router.refresh()
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <Link href="/employees" className="text-sm text-gray-500 hover:text-gray-700">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">Novo Funcionário</h1>
      </div>

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
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pagamento *</label>
            <select
              value={form.paymentType}
              onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="DAILY">Diária (valor fixo por dia)</option>
              <option value="PRODUCTION">Produção (valor por peça)</option>
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
                placeholder="0,00"
              />
            </div>
          )}

          {form.paymentType === "PRODUCTION" && (
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-purple-700">
                O valor por peça é definido nos <strong>Tipos de Serviço</strong>.
                O funcionário pode ter diferentes valores para cada serviço que realiza.
              </p>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/employees"
              className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
