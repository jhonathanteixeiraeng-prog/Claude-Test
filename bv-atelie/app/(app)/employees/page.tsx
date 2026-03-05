import { prisma } from "@/lib/prisma"
import Link from "next/link"
import EmployeeActions from "./EmployeeActions"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Funcionários</h1>
          <p className="text-gray-500 text-sm">{employees.filter((e) => e.active).length} ativos</p>
        </div>
        <Link
          href="/employees/new"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          + Novo Funcionário
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {employees.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-4xl mb-2">👥</p>
            <p>Nenhum funcionário cadastrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className={`px-4 py-3 flex items-center justify-between gap-3 ${!emp.active ? "opacity-50" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800 text-sm">{emp.name}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        emp.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {emp.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        emp.paymentType === "DAILY"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {emp.paymentType === "DAILY" ? "Diária" : "Produção"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {emp.paymentType === "DAILY" && emp.dailyRate
                        ? formatCurrency(emp.dailyRate) + "/dia"
                        : emp.paymentType === "PRODUCTION"
                        ? "por peça"
                        : "-"}
                    </span>
                    {emp.phone && (
                      <span className="text-xs text-gray-400">{emp.phone}</span>
                    )}
                  </div>
                </div>
                <EmployeeActions employee={emp} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
