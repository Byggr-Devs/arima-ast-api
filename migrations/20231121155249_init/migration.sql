/*
  Warnings:

  - You are about to drop the column `duration` on the `JobRegistration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobRegistration" DROP COLUMN "duration";

-- AlterTable
ALTER TABLE "JobStageStatus" ADD COLUMN     "duration" DOUBLE PRECISION NOT NULL DEFAULT 0;
