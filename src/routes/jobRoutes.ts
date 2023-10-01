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

  const serviceCenter = await prisma.serviceCenter.findUnique({
    where: { id: serviceCenterId },
    include: { stages: true },
  });

  if (!serviceCenter) {
    res.status(400).send({ error: "Invalid Service Center" });
    return;
  }

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
      jobStageStatuses: {
        create: serviceCenter.stages.map((stage) => ({
          stageId: stage.id,
        })),
      },
    },
    include: {
      serviceTypes: { include: { serviceType: true } },
    },
  });

  res.send({ data: job });
});

router.get("/registrationParams", async (req, res) => {
  const serviceCenters = await prisma.serviceCenter.findMany({
    include: { serviceTypes: true, stages: true },
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
      jobStageStatuses: { include: { stage: true } },
    },
  });

  res.send({ data: jobs });
});

router.post("/update-job", async (req, res) => {
  const {
    jobId,
    jobStageStatuses,
  }: {
    jobId: string;
    jobStageStatuses: {
      status:
        | "WAITING"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "YELLOW_ALERT"
        | "RED_ALERT";
      stageId: string;
    }[];
  } = req.body;

  const job = await prisma.jobRegistration.update({
    where: {
      id: jobId,
    },
    data: {
      jobStageStatuses: {
        updateMany: jobStageStatuses.map((jobStageStatus) => ({
          data: {
            status: jobStageStatus.status,
          },
          where: {
            stageId: jobStageStatus.stageId,
          },
        })),
      },
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
    where: {},
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
      stages: {
        create: [
          { name: "Waiting" },
          { name: "Stage 1" },
          { name: "Stage 2" },
          { name: "Stage 3" },
          { name: "Water Wash" },
        ],
      },
    },
  });
  res.send({ data: r });
});

export default router;
