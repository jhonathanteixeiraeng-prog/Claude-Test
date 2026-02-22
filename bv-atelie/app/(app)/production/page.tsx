import { prisma } from "@/lib/prisma"
import ProductionManager from "./ProductionManager"
import { format } from "date-fns"

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const dateStr = params.date || format(new Date(), "yyyy-MM-dd")

  const dateObj = new Date(dateStr)
  dateObj.setUTCHours(0, 0, 0, 0)
  const dateEnd = new Date(dateStr)
  dateEnd.setUTCHours(23, 59, 59, 999)

  const [employees, serviceTypes, records] = await Promise.all([
    prisma.employee.findMany({
      where: { active: true, paymentType: "PRODUCTION" },
      orderBy: { name: "asc" },
    }),
    prisma.serviceType.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.productionRecord.findMany({
      where: { date: { gte: dateObj, lte: dateEnd } },
      include: { employee: true, serviceType: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Controle de Produção</h1>
        <p className="text-gray-500 text-sm">Registre as peças produzidas por funcionário</p>
      </div>
      <ProductionManager
        employees={employees}
        serviceTypes={serviceTypes}
        initialRecords={records}
        selectedDate={dateStr}
      />
    </div>
  )
}
