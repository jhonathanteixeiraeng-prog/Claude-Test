"use client"

import { useRouter } from "next/navigation"

type Employee = {
  id: string
  name: string
  active: boolean
}

export default function EmployeeActions({ employee }: { employee: Employee }) {
  const router = useRouter()

  async function toggleActive() {
    await fetch(`/api/employees/${employee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !employee.active }),
    })
    router.refresh()
  }

  return (
    <div className="flex gap-2 justify-end">
      <a
        href={`/employees/${employee.id}`}
        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
      >
        Editar
      </a>
      <button
        onClick={toggleActive}
        className={`text-xs font-medium ${
          employee.active ? "text-red-500 hover:text-red-700" : "text-green-600 hover:text-green-800"
        }`}
      >
        {employee.active ? "Desativar" : "Ativar"}
      </button>
    </div>
  )
}
