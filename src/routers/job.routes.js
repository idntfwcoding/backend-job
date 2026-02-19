import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { applyToJob } from "../controllers/application.controller.js";
import { getApplicantsForJob } from "../controllers/application.controller.js";
import { getMyPostedJobs, searchJobs , createJob, getJobById, deleteJob } from "../controllers/job.controllers.js";
const router = Router();

router.route("/search").get(searchJobs)

router.route("/me").get(verifyJWT , getMyPostedJobs)

router.route("/:id")
  .get(getJobById)
  .delete(verifyJWT , deleteJob)

router.route("/:jobId/apply").post(verifyJWT , applyToJob );

router.route("/").post(verifyJWT , createJob)

router.route("/:jobId/applicants").get( verifyJWT , getApplicantsForJob)


export default router