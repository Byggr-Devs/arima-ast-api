/*
  Warnings:

  - The primary key for the `ServiceType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ServiceType` table. All the data in the column will be lost.
  - You are about to drop the `ServiceCenterServiceType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `serviceCenterId` to the `ServiceType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "JobRegistrationServiceType" DROP CONSTRAINT "JobRegistrationServiceType_serviceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceCenterServiceType" DROP CONSTRAINT "ServiceCenterServiceType_serviceCenterId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceCenterServiceType" DROP CONSTRAINT "ServiceCenterServiceType_serviceTypeId_fkey";

-- AlterTable
ALTER TABLE "ServiceType" DROP CONSTRAINT "ServiceType_pkey",
DROP COLUMN "id",
ADD COLUMN     "serviceCenterId" TEXT NOT NULL,
ADD CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("serviceCenterId");

-- DropTable
DROP TABLE "ServiceCenterServiceType";

-- AddForeignKey
ALTER TABLE "ServiceType" ADD CONSTRAINT "ServiceType_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRegistrationServiceType" ADD CONSTRAINT "JobRegistrationServiceType_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("serviceCenterId") ON DELETE RESTRICT ON UPDATE CASCADE;
