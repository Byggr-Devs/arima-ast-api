/*
  Warnings:

  - The primary key for the `ServiceType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `ServiceType` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "JobRegistrationServiceType" DROP CONSTRAINT "JobRegistrationServiceType_serviceTypeId_fkey";

-- AlterTable
ALTER TABLE "ServiceType" DROP CONSTRAINT "ServiceType_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "JobRegistrationServiceType" ADD CONSTRAINT "JobRegistrationServiceType_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
