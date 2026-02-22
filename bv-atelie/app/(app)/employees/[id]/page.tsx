import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditEmployeeForm from "./EditEmployeeForm"

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const employee = await prisma.employee.findUnique({ where: { id } })
  if (!employee) notFound()

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <a href="/employees" className="text-sm text-gray-500 hover:text-gray-700">
          ← Voltar
        </a>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">Editar Funcionário</h1>
      </div>
      <EditEmployeeForm employee={employee} />
    </div>
  )
}
