import { prisma } from "@/lib/prisma"
import ServiceTypeManager from "./ServiceTypeManager"

export default async function ServiceTypesPage() {
  const serviceTypes = await prisma.serviceType.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tipos de Serviço</h1>
        <p className="text-gray-500 text-sm">Cadastre os serviços realizados e seus valores por peça</p>
      </div>
      <ServiceTypeManager initialServiceTypes={serviceTypes} />
    </div>
  )
}
