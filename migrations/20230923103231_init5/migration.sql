-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('SERVICEMANAGER', 'TECHNICIAN', 'FLOORMANAGER');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ENGINEERING', 'MANAGEMENT');

-- CreateEnum
CREATE TYPE "UserClass" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "JobStageStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT,
    "employeeId" TEXT NOT NULL,
    "designation" "Designation" NOT NULL,
    "department" "Department" NOT NULL,
    "location" TEXT,
    "userClass" "UserClass" NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "vehicleModels" TEXT[],

    CONSTRAINT "ServiceCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCenterStage" (
    "serviceCenterId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,

    CONSTRAINT "ServiceCenterStage_pkey" PRIMARY KEY ("serviceCenterId","stageId")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "serviceCenterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("serviceCenterId")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCenterAlert" (
    "serviceCenterId" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,

    CONSTRAINT "ServiceCenterAlert_pkey" PRIMARY KEY ("serviceCenterId","alertId")
);

-- CreateTable
CREATE TABLE "JobRegistration" (
    "id" TEXT NOT NULL,
    "serviceCenterId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "extraServiceRequired" BOOLEAN NOT NULL,
    "extraServiceTimeEstimate" TEXT,
    "estimatedDeliveryTimestamp" TIMESTAMP(3),
    "priority" "Priority" NOT NULL DEFAULT 'LOW',
    "startTimestamp" TIMESTAMP(3),
    "endTimestamp" TIMESTAMP(3),
    "waitingStageStatus" "JobStageStatus" NOT NULL DEFAULT 'WAITING',
    "stageOneStatus" "JobStageStatus" NOT NULL DEFAULT 'WAITING',
    "stageTwoStatus" "JobStageStatus" NOT NULL DEFAULT 'WAITING',
    "stageThreeStatus" "JobStageStatus" NOT NULL DEFAULT 'WAITING',
    "waterWashStageStatus" "JobStageStatus" NOT NULL DEFAULT 'WAITING',

    CONSTRAINT "JobRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRegistrationServiceType" (
    "jobRegistrationId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,

    CONSTRAINT "JobRegistrationServiceType_pkey" PRIMARY KEY ("jobRegistrationId","serviceTypeId")
);

-- CreateTable
CREATE TABLE "JobTracking" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "cameraId" TEXT NOT NULL,
    "detectedTimestamp" TIMESTAMP(3) NOT NULL,
    "detectedImageUrl" TEXT NOT NULL,

    CONSTRAINT "JobTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camera" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ServiceCenterToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "_ServiceCenterToUser_AB_unique" ON "_ServiceCenterToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ServiceCenterToUser_B_index" ON "_ServiceCenterToUser"("B");

-- AddForeignKey
ALTER TABLE "ServiceCenterStage" ADD CONSTRAINT "ServiceCenterStage_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCenterStage" ADD CONSTRAINT "ServiceCenterStage_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceType" ADD CONSTRAINT "ServiceType_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCenterAlert" ADD CONSTRAINT "ServiceCenterAlert_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCenterAlert" ADD CONSTRAINT "ServiceCenterAlert_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRegistrationServiceType" ADD CONSTRAINT "JobRegistrationServiceType_jobRegistrationId_fkey" FOREIGN KEY ("jobRegistrationId") REFERENCES "JobRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRegistrationServiceType" ADD CONSTRAINT "JobRegistrationServiceType_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("serviceCenterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTracking" ADD CONSTRAINT "JobTracking_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTracking" ADD CONSTRAINT "JobTracking_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceCenterToUser" ADD CONSTRAINT "_ServiceCenterToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ServiceCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceCenterToUser" ADD CONSTRAINT "_ServiceCenterToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
