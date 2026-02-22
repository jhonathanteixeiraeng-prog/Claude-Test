"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type ServiceType = {
  id: string
  name: string
  pricePerUnit: number
  active: boolean
}

export default function ServiceTypeManager({ initialServiceTypes }: { initialServiceTypes: ServiceType[] }) {
  const router = useRouter()
  const [serviceTypes, setServiceTypes] = useState(initialServiceTypes)
  const [form, setForm] = useState({ name: "", pricePerUnit: "" })
  const [editing, setEditing] = useState<ServiceType | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/service-types", {
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

    const newSt = await res.json()
    setServiceTypes([...serviceTypes, newSt])
    setForm({ name: "", pricePerUnit: "" })
    setLoading(false)
    router.refresh()
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setLoading(true)

    const res = await fetch(`/api/service-types/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editing.name, pricePerUnit: editing.pricePerUnit }),
    })

    if (res.ok) {
      const updated = await res.json()
      setServiceTypes(serviceTypes.map((st) => (st.id === updated.id ? updated : st)))
      setEditing(null)
    }
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/service-types/${id}`, { method: "DELETE" })
    setServiceTypes(serviceTypes.map((st) => (st.id === id ? { ...st, active: false } : st)))
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Novo Tipo de Serviço</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Nome do serviço (ex: Bordado, Bainha)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.pricePerUnit}
              onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })}
              required
              placeholder="0,00 /peça"
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            Adicionar
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {serviceTypes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">🏷️</p>
            <p>Nenhum tipo de serviço cadastrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Serviço</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Valor por Peça</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {serviceTypes.map((st) => (
                <tr key={st.id} className={!st.active ? "opacity-50" : ""}>
                  <td className="px-5 py-4">
                    {editing?.id === st.id ? (
                      <input
                        type="text"
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        className="px-2 py-1 border border-purple-300 rounded text-sm w-full"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{st.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {editing?.id === st.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editing.pricePerUnit}
                        onChange={(e) =>
                          setEditing({ ...editing, pricePerUnit: parseFloat(e.target.value) })
                        }
                        className="px-2 py-1 border border-purple-300 rounded text-sm w-24"
                      />
                    ) : (
                      st.pricePerUnit.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        st.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {st.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {editing?.id === st.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleUpdate}
                          disabled={loading}
                          className="text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditing(st)}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Editar
                        </button>
                        {st.active && (
                          <button
                            onClick={() => handleDelete(st.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Desativar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
