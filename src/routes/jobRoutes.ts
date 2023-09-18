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
  const serviceTypes = await prisma.serviceType.findMany();
  const serviceCenters = await prisma.serviceCenter.findMany();
  const priorities = ["HIGH", "MEDIUM", "LOW", "URGENT"];

  res.send({ data: { serviceTypes, serviceCenters, priorities } });
});

router.get("/tracking", async (req, res) => {
    const jobs = await prisma.jobRegistration.findMany({
        include: {
        serviceTypes: { include: { serviceType: true } },
        },
    });
    
    res.send({ data: jobs });
    }
);

export default router;
