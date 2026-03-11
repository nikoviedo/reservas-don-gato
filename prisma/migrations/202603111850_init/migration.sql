-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('HOLD', 'PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "pax" INTEGER NOT NULL,
    "notes" TEXT,
    "tableId" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'HOLD',
    "confirmKeyHash" TEXT,
    "confirmKeyExpiresAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "whatsappStatus" TEXT,
    "whatsappError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enableTableSelection" BOOLEAN NOT NULL DEFAULT false,
    "bookingRules" JSONB NOT NULL,
    "whatsapp" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCache" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "blockedEvents" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_code_key" ON "Reservation"("code");

-- CreateIndex
CREATE INDEX "Reservation_date_time_idx" ON "Reservation"("date", "time");

-- CreateIndex
CREATE INDEX "Reservation_phone_idx" ON "Reservation"("phone");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");
