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
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp) => (
                <tr key={emp.id} className={`${!emp.active ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{emp.name}</p>
                    {emp.phone && <p className="text-xs text-gray-400">{emp.phone}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        emp.paymentType === "DAILY"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {emp.paymentType === "DAILY" ? "Diária" : "Produção"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {emp.paymentType === "DAILY" && emp.dailyRate
                      ? formatCurrency(emp.dailyRate) + "/dia"
                      : emp.paymentType === "PRODUCTION"
                      ? "por peça"
                      : "-"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        emp.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {emp.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <EmployeeActions employee={emp} />
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
