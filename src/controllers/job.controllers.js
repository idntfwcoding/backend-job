import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Job } from "../models/job.model.js";

const createJob = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role !== "recruiter") {
    throw new ApiError(403, "Only recruiters can create jobs");
  }

  const { title, salary, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }


  const job = await Job.create({
    title,
    description,
    salary,
    jobOwner: user._id,
  });

  
  return res.status(201).json(
    new ApiResponse(201, job, "Job created successfully")
  );
});

const getMyPostedJobs = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role !== "recruiter") {
    throw new ApiError(403, "Only recruiters can view their posted jobs");
  }

  const jobs = await Job.find({ jobOwner: user._id })
    .populate({
      path: "jobOwner",
      select: "username avatar email" 
    })
    .sort({ createdAt: -1 });

  // SAFE LOGGING: Prevent crash if jobs array is empty
  if (jobs && jobs.length > 0) {
    console.log("Populated Job Example:", jobs[0]);
  }

  return res.status(200).json(
    new ApiResponse(200, jobs, "Your posted jobs fetched successfully")
  );
});

const searchJobs = asyncHandler(async (req, res) => {
  const { keyword, minSalary, maxSalary, sort } = req.query;

  const query = {};

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  if (minSalary || maxSalary) {
    query.salary = {};
    if (minSalary) query.salary.$gte = Number(minSalary);
    if (maxSalary) query.salary.$lte = Number(maxSalary);
  }

  let sortOption = { createdAt: -1 };
  if (sort === "salary") {
    sortOption = { salary: -1 };
  }

  // FIXED LINE BELOW: Added 'avatar' to the selection string
  const jobs = await Job.find(query)
    .populate("jobOwner", "username email avatar role") 
    .sort(sortOption);

  return res.status(200).json(
    new ApiResponse(200, jobs, "Jobs fetched successfully")
  );
});

const getJobById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const job = await Job.findById(id).populate("jobOwner", "username email avatar");

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json(
        new ApiResponse(200, job, "Job fetched successfully")
    )
});

import mongoose from 'mongoose';

const deleteJob = asyncHandler(async (req, res) => {
    const id = req.params.id.trim();
    
    const job = await Job.findById(id);

    if (!job) {
        // Stop the frontend from hanging by sending a 404
        return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Since jobOwner is populated, we use ._id
    const ownerId = job.jobOwner._id || job.jobOwner; 
    
    if (ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Job.findByIdAndDelete(id);

    // THIS IS THE STOP COMMAND FOR "DELETING..."
    return res.status(200).json({
        success: true,
        message: "Job deleted successfully"
    });
});

export { 
    createJob,
    getMyPostedJobs,
    searchJobs,
    getJobById,
    deleteJob
}
