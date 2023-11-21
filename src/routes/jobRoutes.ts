import { JobStageStatus, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { sendRedAlert, sendYellowAlert } from "../services/alert.service";

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
      serviceTypes: serviceCenters[0]?.serviceTypes,
      serviceCenters,
      priorities,
    },
  });
});

router.get("/tracking", async (req, res) => {
  const jobs = await prisma.jobRegistration.findMany({
    include: {
      serviceTypes: { include: { serviceType: true } },
      jobStageStatuses: {
        include: { stage: true },
        orderBy: { stage: { name: "asc" } },
      },
    },
    where: {
      jobStageStatuses: {
        some: {
          status: {
            in: ["WAITING", "IN_PROGRESS", "YELLOW_ALERT", "RED_ALERT"],
          },
        },
      },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  res.send({ data: jobs });
});

router.post("/update-job", async (req, res) => {
  const {
    jobId,
    jobStageStatuses,
    isPinned,
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
    isPinned: boolean;
  } = req.body;

  const oldJob = await prisma.jobRegistration.findUnique({
    where: {
      id: jobId,
    },
    include: {
      jobStageStatuses: { include: { stage: true } },
    },
  });

  if (!oldJob) {
    res.status(400).send({ error: "Invalid Job Id" });
    return;
  }

  const job = await prisma.jobRegistration.update({
    where: {
      id: jobId,
    },
    data: {
      jobStageStatuses: {
        updateMany: jobStageStatuses.map((jobStageStatus) => {
          let jobStageStatusOld = oldJob.jobStageStatuses.find(
            (jobStageStatusOld) =>
              jobStageStatusOld.stageId === jobStageStatus.stageId
          )
          switch (jobStageStatus.status) {
            case "IN_PROGRESS":
              return {
                data: {
                  status: jobStageStatus.status,
                  startTimestamp: new Date(),
                },
                where: {
                  stageId: jobStageStatus.stageId,
                },
              };
            case "COMPLETED":
              return {
                data: {
                  status: jobStageStatus.status,
                  endTimestamp: new Date(),
                  duration: Date.now() - (jobStageStatusOld?.startTimestamp?.getTime() ?? Date.now())  + Number(jobStageStatusOld?.duration),
                },
                where: {
                  stageId: jobStageStatus.stageId,
                },
              };
            default:
              return {
                data: {
                  status: jobStageStatus.status,
                },
                where: {
                  stageId: jobStageStatus.stageId,
                },
              };
          }
        }),
      },
      isPinned,
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

router.get("/update-alert-durations", async (req, res) => {
  const redAlertDuration = 20000;
  const yellowAlertDuration = 10000;

  const stage = await prisma.stage.updateMany({
    where: {},
    data: {
      redAlertDuration: Number(redAlertDuration),
      yellowAlertDuration: Number(yellowAlertDuration),
    },
  });

  res.send({ data: stage });
});

router.get("/setup-db", async (req, res) => {
  const waitingStageCameraEntry = await prisma.camera.create({
    data: {
      name: "Waiting Stage Camera Entry",
      ip: "",
      port: "",
      password: "",
      url: "",
      username: "",
    },
  });
  const waitingStageCameraExit = await prisma.camera.create({
    data: {
      name: "Waiting Stage Camera Exit",
      ip: "",
      port: "",
      password: "",
      url: "",
      username: "",
    },
  });
  const stage1CameraEntry = await prisma.camera.create({
    data: {
      name: "Stage 1 Camera Entry",
      ip: "",
      port: "",
      password: "",
      url: "",
      username: "",
    },
  });
  const stage1CameraExit = await prisma.camera.create({
    data: {
      name: "Stage 1 Camera Exit",
      ip: "",
      port: "",
      password: "",
      url: "",
      username: "",
    },
  });
  const stage2CameraEntry = await prisma.camera.create({
    data: {
      name: "Stage 2 Camera Entry",
      ip: "",
      port: "",
      password: "",
      url: "",
      username: "",
    },
  });
  const stage2CameraExit = await prisma.camera.create({
    data: {
      name: "Stage 2 Camera Exit",
      ip: "",
      port: "",
      password: "",
      url: "",
      username: "",
    },
  });
  const stage3CameraEntry = await prisma.camera.create({
    data: {
      name: "Stage 3 Camera Entry",
      ip: "",
      port: "",
      password: "",
      url: "",
      username: "",
    },
  });
  const stage3CameraExit = await prisma.camera.create({
    data: {
      name: "Stage 3 Camera Exit",
      ip: "",
      port: "",
      password: "",
      url: "",
      username: "",
    },
  });
  const waterWashCameraEntry = await prisma.camera.create({
    data: {
      name: "Water Wash Camera Entry",
      ip: "",
      port: "",
      password: "",
      url: "",
      username: "",
    },
  });
  const waterWashCameraExit = await prisma.camera.create({
    data: {
      name: "Water Wash Camera Exit",
      ip: "",
      port: "",
      password: "",
      url: "",
      username: "",
    },
  });

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
          {
            name: "Waiting",
            entryCameraId: waitingStageCameraEntry.id,
            exitCameraId: waitingStageCameraExit.id,
            redAlertDuration: 20000,
            yellowAlertDuration: 10000,
          },
          {
            name: "Stage 1",
            entryCameraId: stage1CameraEntry.id,
            exitCameraId: stage1CameraExit.id,
            redAlertDuration: 20000,
            yellowAlertDuration: 10000,
          },
          {
            name: "Stage 2",
            entryCameraId: stage2CameraEntry.id,
            exitCameraId: stage2CameraExit.id,
            redAlertDuration: 20000,
            yellowAlertDuration: 10000,
          },
          {
            name: "Stage 3",
            entryCameraId: stage3CameraEntry.id,
            exitCameraId: stage3CameraExit.id,
            redAlertDuration: 20000,
            yellowAlertDuration: 10000,
          },
          {
            name: "Water Wash",
            entryCameraId: waterWashCameraEntry.id,
            exitCameraId: waterWashCameraExit.id,
            redAlertDuration: 20000,
            yellowAlertDuration: 10000,
          },
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
            const startTimestampOld = jobStageStatus.startTimestamp;
            if (!startTimestampOld) return jobStageStatus;
            const timeElapsed = Date.now() - startTimestampOld.getTime() + Number(jobStageStatus.duration);
            if (timeElapsed > jobStageStatus.stage.redAlertDuration) {
              sendRedAlert(job, jobStageStatus);
              return {
                ...jobStageStatus,
                status: "RED_ALERT",
              };
            }
            if (timeElapsed > jobStageStatus.stage.yellowAlertDuration) {
              sendYellowAlert(job, jobStageStatus);
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

router.post("/add-ml-entry", async (req, res) => {
  const { vehicleNumber, entry, imageUrl, cameraId } = req.body;

  let response;
  if (entry) {
    response = await prisma.jobStageStatus.updateMany({
      data: {
        status: "IN_PROGRESS",
        startTimestamp: new Date(),
        entryImageUrl: imageUrl,
      },
      where: {
        AND: {
          stage: {
            entryCameraId: cameraId,
          },
          job: {
            vehicleNumber,
          },
        },
      },
    });
  } else {
    response = await prisma.jobStageStatus.updateMany({
      data: {
        status: "COMPLETED",
        endTimestamp: new Date(),
        exitImageUrl: imageUrl,
      },
      where: {
        AND: {
          stage: {
            exitCameraId: cameraId,
          },
          job: {
            vehicleNumber,
          },
        },
      },
    });
  }

  res.send({ data: response });
});

export default router;
