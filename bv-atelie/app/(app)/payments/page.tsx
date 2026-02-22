import { prisma } from "@/lib/prisma"
import PaymentsManager from "./PaymentsManager"

export default async function PaymentsPage() {
  const [employees, payments] = await Promise.all([
    prisma.employee.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.payment.findMany({
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pagamentos</h1>
        <p className="text-gray-500 text-sm">
          Feche pagamentos por período e controle quem foi pago
        </p>
      </div>
      <PaymentsManager employees={employees} initialPayments={payments} />
    </div>
  )
}
