-- CreateTable
CREATE TABLE "AlertPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertaRojo" BOOLEAN NOT NULL DEFAULT true,
    "alertaAmarillo" BOOLEAN NOT NULL DEFAULT true,
    "alertaVerde" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertPreference_userId_key" ON "AlertPreference"("userId");

-- AddForeignKey
ALTER TABLE "AlertPreference" ADD CONSTRAINT "AlertPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
