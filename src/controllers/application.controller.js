import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";


const getMyApplications = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role !== "candidate") {
    throw new ApiError(403, "Only candidates can view their applications");
  }

  const applications = await Application.find({
    appliedBy: user._id,
  })
    .populate({
      path: "jobTitle",
      populate: {
        path: "jobOwner",
        select: "username email role",
      },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, applications, "Applications fetched successfully")
  );
});

const getApplicantsForJob = asyncHandler(async (req, res) => {
  const user = req.user;
  const { jobId } = req.params;

  // 1️⃣ Role check
  if (user.role !== "recruiter") {
    throw new ApiError(403, "Only recruiters can view applicants");
  }

  // 2️⃣ Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  // 3️⃣ Ownership check
  if (job.jobOwner.toString() !== user._id.toString()) {
    throw new ApiError(403, "You are not authorized to view applicants for this job");
  }

  // 4️⃣ Fetch applications
  const applications = await Application.find({
    jobTitle: jobId,
  })
    .populate("appliedBy", "username email role")
    .sort({ createdAt: -1 });

  // 5️⃣ Response
  return res.status(200).json(
    new ApiResponse(200, applications, "Applicants fetched successfully")
  );
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const user = req.user;
  const { applicationId } = req.params;
  const { status } = req.body;

  // 1️⃣ Role check
  if (user.role !== "recruiter") {
    throw new ApiError(403, "Only recruiters can update application status");
  }

  // 2️⃣ Normalize & validate status
  const normalizedStatus = status?.trim().toLowerCase();
  const allowedStatuses = ["accepted", "rejected"];

  if (!allowedStatuses.includes(normalizedStatus)) {
    throw new ApiError(400, "Invalid status value");
  }

  // 3️⃣ Find application
  const application = await Application.findById(applicationId);
  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  // 4️⃣ Check job ownership
  const job = await Job.findById(application.jobTitle);
  if (!job) {
    throw new ApiError(404, "Associated job not found");
  }

  if (job.jobOwner.toString() !== user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this application");
  }

  // 5️⃣ Update status
  application.status = normalizedStatus;
  await application.save();

  // 6️⃣ Response
  return res.status(200).json(
    new ApiResponse(
      200,
      application,
      "Application status updated successfully"
    )
  );
});

const applyToJob = asyncHandler(async (req, res) => {
  const user = req.user;
  const { jobId } = req.params;

  // 1️⃣ Role check
  if (user.role !== "candidate") {
    throw new ApiError(403, "Only candidates can apply to jobs");
  }

  // 2️⃣ Job existence check
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  // 3️⃣ Prevent duplicate application
  const alreadyApplied = await Application.findOne({
    jobTitle: jobId,
    appliedBy: user._id,
  });

  if (alreadyApplied) {
    throw new ApiError(409, "You have already applied to this job");
  }

  // 4️⃣ Create application
  const application = await Application.create({
    jobTitle: jobId,
    appliedBy: user._id,
    appliedTo: job.jobOwner,
  });

  // 5️⃣ Response
  return res.status(201).json(
    new ApiResponse(201, application, "Applied to job successfully")
  );
});

export { 
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
  applyToJob
 };
