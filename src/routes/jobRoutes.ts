import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();

const prisma = new PrismaClient();

router.post("/job", async (req, res) => {
  const {
    ownerName,
    vehicleModel,
    vehicleNumber,
    phoneNumber,
    servicesRequired,
    extraServiceRequired,
    extraServiceTime,
    estimatedDeliveryTimestamp,
    priority,
    serviceCenterId,
    startTimestamp,
  } = req.body;

  const job = await prisma.jobRegistration.create({
    data: {
      serviceCenterId,
      startTimestamp,
      ownerName,
      vehicleModel,
      vehicleNumber,
      ownerPhone: phoneNumber,
      extraServiceRequired,
      serviceTypes: {
        create: [
          ...servicesRequired.map((serviceTypeId: string) => ({
            serviceTypeId,
          })),
        ],
      },
      extraServiceTimeEstimate: extraServiceTime,
      estimatedDeliveryTimestamp,
      priority,
      waitingStageStatus: "WAITING",
      stageOneStatus: "WAITING",
      stageTwoStatus: "WAITING",
      stageThreeStatus: "WAITING",
      waterWashStageStatus: "WAITING",
    },
    include: {
      serviceTypes: { include: { serviceType: true } },
    },
  });

  res.send({ data: job });
});

router.get("/registrationParams", async (req, res) => {
  const serviceCenters = await prisma.serviceCenter.findMany({
    include: { serviceTypes: true },
  });
  const priorities = ["HIGH", "MEDIUM", "LOW", "URGENT"];

  res.send({
    data: {
      serviceTypes: serviceCenters[0].serviceTypes,
      serviceCenters,
      priorities,
    },
  });
});

router.get("/tracking", async (req, res) => {
  const jobs = await prisma.jobRegistration.findMany({
    include: {
      serviceTypes: { include: { serviceType: true } },
    },
  });

  res.send({ data: jobs });
});

router.post("/update-job", async (req, res) => {
  const {
    jobId,
    waitingStageStatus,
    stageOneStatus,
    stageTwoStatus,
    stageThreeStatus,
    waterWashStageStatus,
  } = req.body;

  const job = await prisma.jobRegistration.update({
    where: {
      id: jobId,
    },
    data: {
      waitingStageStatus,
      stageOneStatus,
      stageTwoStatus,
      stageThreeStatus,
      waterWashStageStatus,
    },
    include: {
      serviceTypes: { include: { serviceType: true } },
    },
  });

  res.send({ data: job });
});

router.get("/jobs-filtered", async (req, res) => {
  const { stage } = req.query;

  const jobs = await prisma.jobRegistration.findMany({
    where: {
      
    },
    include: {
      serviceTypes: { include: { serviceType: true } },
    },
  });

  res.send({ data: jobs });
});

router.get("/setup-db", async (req, res) => {
  const r = await prisma.serviceCenter.create({
    data: {
      id: "service-center-1",
      name: "Service Center 1",
      city: "Chennai",
      country: "India",
      pincode: "600001",
      state: "Tamil Nadu",
      zone: "South",
      serviceTypes: {
        create: [
          { name: "Service Type 1" },
          { name: "Service Type 2" },
          { name: "Service Type 3" },
        ],
      },
    },
  });
  res.send({ data: r });
});

export default router;
