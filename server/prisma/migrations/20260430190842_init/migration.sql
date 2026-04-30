-- CreateTable
CREATE TABLE "FieldRecord" (
    "id" TEXT NOT NULL,
    "plot" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "ndvi" DOUBLE PRECISION NOT NULL,
    "ndre" DOUBLE PRECISION NOT NULL,
    "gndvi" DOUBLE PRECISION NOT NULL,
    "moisture" INTEGER NOT NULL,
    "temperature" INTEGER NOT NULL,
    "nitrogen" INTEGER NOT NULL,
    "phosphorus" INTEGER NOT NULL,
    "potassium" INTEGER NOT NULL,
    "waterStress" TEXT NOT NULL,
    "nutrientStress" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldRecord_pkey" PRIMARY KEY ("id")
);
