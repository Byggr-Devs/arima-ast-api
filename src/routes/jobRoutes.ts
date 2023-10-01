import { JobStageStatus, PrismaClient } from "@prisma/client";
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
    include: { serviceTypes: true, stages: true },
  });
  res.send({ data: r });
});

router.get("/process-jobs", async (req, res) => {
  // get all jobs and their stages
  // for each stage, if the stage is not completed and in progress for more than 30 mins, set it to red alert
  // for each stage, if the stage is not completed and in progress for more than 15 mins, set it to yellow alert

  const jobs = await prisma.jobRegistration.findMany({
    include: {
      jobStageStatuses: { include: { stage: true } },
    },
  });

  const updatedJobs = () => {
    return jobs.map(async (job) => {
      const jobStageStatuses: JobStageStatus[] = job.jobStageStatuses.map(
        (jobStageStatus) => {
          if (
            jobStageStatus.status === "IN_PROGRESS" ||
            jobStageStatus.status === "YELLOW_ALERT"
          ) {
            const timeElapsed = Date.now() - jobStageStatus.updatedAt.getTime();
            // if (timeElapsed > 30 * 60 * 1000) {
            if (timeElapsed > 50 * 1000) {
              return {
                ...jobStageStatus,
                status: "RED_ALERT",
              };
            }
            // if (timeElapsed > 15 * 60 * 1000) {
            if (timeElapsed > 5 * 1000) {
              return {
                ...jobStageStatus,
                status: "YELLOW_ALERT",
              };
            }
          }
          return jobStageStatus;
        }
      );
      return prisma.jobRegistration.update({
        where: {
          id: job.id,
        },
        data: {
          jobStageStatuses: {
            updateMany: jobStageStatuses.map((jobStageStatus) => ({
              data: {
                status: jobStageStatus.status,
                updatedAt: jobStageStatus.updatedAt,
              },
              where: {
                stageId: jobStageStatus.stageId,
              },
            })),
          },
        },
        include: {
          serviceTypes: { include: { serviceType: true } },
          jobStageStatuses: { include: { stage: true } },
        },
      });
    });
  };
  const r = await Promise.all(updatedJobs());

  res.send({ data: r });
});

router.delete("/delete-job/:jobId", async (req, res) => {
  const jobId = req.params.jobId;
  
  const job = await prisma.$transaction([
    prisma.jobStageStatus.deleteMany({
      where: {
        jobId,
      },
    }),
    prisma.jobRegistrationServiceType.deleteMany({
      where: {
        jobRegistrationId: jobId,
      },
    }),
    prisma.jobRegistration.delete({
      where: {
        id: jobId,
      },
    }),
  ]);

  res.send({ data: job });
});

export default router;
