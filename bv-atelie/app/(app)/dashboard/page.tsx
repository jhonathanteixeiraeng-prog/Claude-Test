import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default async function DashboardPage() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setUTCHours(23, 59, 59, 999)

  const [totalEmployees, presentToday, absentToday, pendingPayments, recentProduction] =
    await Promise.all([
      prisma.employee.count({ where: { active: true } }),
      prisma.attendance.count({
        where: { date: { gte: today, lte: todayEnd }, status: "PRESENT" },
      }),
      prisma.attendance.count({
        where: { date: { gte: today, lte: todayEnd }, status: "ABSENT" },
      }),
      prisma.payment.findMany({
        where: { status: "PENDING" },
        include: { employee: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.productionRecord.findMany({
        where: { date: { gte: today, lte: todayEnd } },
        include: { employee: true, serviceType: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ])

  const pendingTotal = pendingPayments.reduce((sum, p) => sum + p.totalAmount, 0)

  const todayStr = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 capitalize">{todayStr}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Funcionários Ativos</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{totalEmployees}</p>
          <p className="text-xs text-gray-400 mt-1">total cadastrados</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Presentes Hoje</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{presentToday}</p>
          <p className="text-xs text-gray-400 mt-1">registros de presença</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Ausentes Hoje</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{absentToday}</p>
          <p className="text-xs text-gray-400 mt-1">registros de ausência</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pagamentos Pendentes</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{formatCurrency(pendingTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">{pendingPayments.length} fechamento(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">💰 Pagamentos Pendentes</h2>
          {pendingPayments.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum pagamento pendente</p>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((p) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{p.employee.name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(p.startDate), "dd/MM")} –{" "}
                      {format(new Date(p.endDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <span className="font-semibold text-orange-500">{formatCurrency(p.totalAmount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Production */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">🧵 Produção de Hoje</h2>
          {recentProduction.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum registro de produção hoje</p>
          ) : (
            <div className="space-y-3">
              {recentProduction.map((r) => (
                <div key={r.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{r.employee.name}</p>
                    <p className="text-xs text-gray-500">{r.serviceType.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-purple-600">{r.quantity} pç</span>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(r.quantity * r.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
