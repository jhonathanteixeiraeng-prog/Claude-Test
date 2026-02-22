import "dotenv/config"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { PrismaClient } from "../app/generated/prisma"
import bcrypt from "bcryptjs"

const adapter = new PrismaLibSql({ url: `file:${process.cwd()}/dev.db` })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const password = await bcrypt.hash("bvatelie2024", 10)

  await prisma.user.upsert({
    where: { email: "admin@bvatelie.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@bvatelie.com",
      password,
    },
  })

  await prisma.user.upsert({
    where: { email: "gerente@bvatelie.com" },
    update: {},
    create: {
      name: "Gerente",
      email: "gerente@bvatelie.com",
      password,
    },
  })

  const serviceTypesData = [
    { name: "Bordado", pricePerUnit: 3.5 },
    { name: "Bainha", pricePerUnit: 1.5 },
    { name: "Costura", pricePerUnit: 2.0 },
    { name: "Acabamento", pricePerUnit: 1.0 },
  ]

  for (const st of serviceTypesData) {
    const exists = await prisma.serviceType.findFirst({ where: { name: st.name } })
    if (!exists) {
      await prisma.serviceType.create({ data: st })
    }
  }

  console.log("✅ Seed concluído!")
  console.log("📧 Email 1: admin@bvatelie.com")
  console.log("📧 Email 2: gerente@bvatelie.com")
  console.log("🔑 Senha: bvatelie2024")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
