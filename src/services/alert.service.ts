import { JobRegistration, JobStageStatus, JobStageStatusEnum } from "@prisma/client";

export const sendRedAlert = (job: JobRegistration, stage: JobStageStatus) => {
    console.log("Sending Red Alert to " + job.ownerPhone, job.startTimestamp, stage);
}

export const sendYellowAlert = (job: JobRegistration, stage: JobStageStatus) => {
    console.log("Sending Yellow Alert to " + job.ownerPhone, job.startTimestamp, stage);
}