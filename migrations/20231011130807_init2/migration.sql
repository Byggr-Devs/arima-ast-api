-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "entryCameraId" TEXT,
ADD COLUMN     "exitCameraId" TEXT;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_entryCameraId_fkey" FOREIGN KEY ("entryCameraId") REFERENCES "Camera"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_exitCameraId_fkey" FOREIGN KEY ("exitCameraId") REFERENCES "Camera"("id") ON DELETE SET NULL ON UPDATE CASCADE;
