-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "redAlertDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "yellowAlertDuration" DOUBLE PRECISION NOT NULL DEFAULT 0;
