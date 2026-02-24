-- BV Atelie e Bordados - Database Setup
-- Run this in the Neon SQL Editor to create all tables

CREATE TABLE IF NOT EXISTS "User" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"      TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "password"  TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Employee" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL,
  "phone"       TEXT,
  "paymentType" TEXT NOT NULL,
  "dailyRate"   DOUBLE PRECISION,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServiceType" (
  "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"         TEXT NOT NULL,
  "pricePerUnit" DOUBLE PRECISION NOT NULL,
  "active"       BOOLEAN NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Attendance" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "employeeId" TEXT NOT NULL,
  "date"       TIMESTAMP(3) NOT NULL,
  "status"     TEXT NOT NULL,
  "note"       TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_employeeId_date_key" ON "Attendance"("employeeId", "date");

CREATE TABLE IF NOT EXISTS "ProductionRecord" (
  "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "employeeId"    TEXT NOT NULL,
  "serviceTypeId" TEXT NOT NULL,
  "date"          TIMESTAMP(3) NOT NULL,
  "quantity"      INTEGER NOT NULL,
  "unitPrice"     DOUBLE PRECISION NOT NULL,
  "note"          TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductionRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Payment" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "employeeId"  TEXT NOT NULL,
  "startDate"   TIMESTAMP(3) NOT NULL,
  "endDate"     TIMESTAMP(3) NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "status"      TEXT NOT NULL DEFAULT 'PENDING',
  "note"        TEXT,
  "paidAt"      TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "Attendance"
  ADD CONSTRAINT "Attendance_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProductionRecord"
  ADD CONSTRAINT "ProductionRecord_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProductionRecord"
  ADD CONSTRAINT "ProductionRecord_serviceTypeId_fkey"
  FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
