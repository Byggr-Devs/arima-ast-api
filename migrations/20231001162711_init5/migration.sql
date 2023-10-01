/*
  Warnings:

  - You are about to drop the column `stageOneStatus` on the `JobRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `stageThreeStatus` on the `JobRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `stageTwoStatus` on the `JobRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `waitingStageStatus` on the `JobRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `waterWashStageStatus` on the `JobRegistration` table. All the data in the column will be lost.
  - You are about to drop the `ServiceCenterStage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `serviceCenterId` to the `Stage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobStageStatusEnum" AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'YELLOW_ALERT', 'RED_ALERT');

-- DropForeignKey
ALTER TABLE "ServiceCenterStage" DROP CONSTRAINT "ServiceCenterStage_serviceCenterId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceCenterStage" DROP CONSTRAINT "ServiceCenterStage_stageId_fkey";

-- AlterTable
ALTER TABLE "JobRegistration" DROP COLUMN "stageOneStatus",
DROP COLUMN "stageThreeStatus",
DROP COLUMN "stageTwoStatus",
DROP COLUMN "waitingStageStatus",
DROP COLUMN "waterWashStageStatus";

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "serviceCenterId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ServiceCenterStage";

-- DropEnum
DROP TYPE "JobStageStatus";

-- CreateTable
CREATE TABLE "JobStageStatus" (
    "jobId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "status" "JobStageStatusEnum" NOT NULL DEFAULT 'WAITING',

    CONSTRAINT "JobStageStatus_pkey" PRIMARY KEY ("jobId","stageId")
);

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStageStatus" ADD CONSTRAINT "JobStageStatus_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStageStatus" ADD CONSTRAINT "JobStageStatus_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
