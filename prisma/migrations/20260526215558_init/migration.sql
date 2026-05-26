-- CreateTable
CREATE TABLE "CopernicusDataCache" (
    "id" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "sst" DOUBLE PRECISION NOT NULL,
    "chlorophyll" DOUBLE PRECISION NOT NULL,
    "anomalia" DOUBLE PRECISION NOT NULL,
    "corrienteU" DOUBLE PRECISION,
    "corrienteV" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopernicusDataCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HABAlert" (
    "id" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "intensidad" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "descripcion" TEXT,
    "fuente" TEXT NOT NULL DEFAULT 'noaa',
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HABAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IFOPMonitoring" (
    "id" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "especieDetectada" TEXT NOT NULL,
    "toxicidad" DOUBLE PRECISION,
    "nivelAlerta" TEXT NOT NULL,
    "toxicidadLimite" DOUBLE PRECISION NOT NULL DEFAULT 400,
    "notas" TEXT,
    "fuente" TEXT NOT NULL DEFAULT 'ifop',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IFOPMonitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SHOAMareasCache" (
    "id" TEXT NOT NULL,
    "puerto" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "nivelPromedio" DOUBLE PRECISION NOT NULL,
    "variabilidad" DOUBLE PRECISION NOT NULL,
    "pleamares" INTEGER NOT NULL,
    "bajamares" INTEGER NOT NULL,
    "optimo" BOOLEAN NOT NULL DEFAULT false,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SHOAMareasCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoMarCache" (
    "id" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "alturaOlas" TEXT NOT NULL,
    "direccionViento" TEXT NOT NULL,
    "velocidadViento" TEXT NOT NULL,
    "tendencia" TEXT NOT NULL,
    "riesgoNavegacion" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstadoMarCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "zonas" TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CopernicusDataCache_zona_idx" ON "CopernicusDataCache"("zona");

-- CreateIndex
CREATE INDEX "CopernicusDataCache_validUntil_idx" ON "CopernicusDataCache"("validUntil");

-- CreateIndex
CREATE INDEX "HABAlert_zona_idx" ON "HABAlert"("zona");

-- CreateIndex
CREATE INDEX "HABAlert_fecha_idx" ON "HABAlert"("fecha");

-- CreateIndex
CREATE INDEX "HABAlert_fuente_idx" ON "HABAlert"("fuente");

-- CreateIndex
CREATE INDEX "IFOPMonitoring_zona_idx" ON "IFOPMonitoring"("zona");

-- CreateIndex
CREATE INDEX "IFOPMonitoring_fecha_idx" ON "IFOPMonitoring"("fecha");

-- CreateIndex
CREATE INDEX "IFOPMonitoring_nivelAlerta_idx" ON "IFOPMonitoring"("nivelAlerta");

-- CreateIndex
CREATE INDEX "SHOAMareasCache_puerto_idx" ON "SHOAMareasCache"("puerto");

-- CreateIndex
CREATE INDEX "SHOAMareasCache_fecha_idx" ON "SHOAMareasCache"("fecha");

-- CreateIndex
CREATE INDEX "SHOAMareasCache_validUntil_idx" ON "SHOAMareasCache"("validUntil");

-- CreateIndex
CREATE INDEX "EstadoMarCache_zona_idx" ON "EstadoMarCache"("zona");

-- CreateIndex
CREATE INDEX "EstadoMarCache_validUntil_idx" ON "EstadoMarCache"("validUntil");
