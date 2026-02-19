import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getMyApplications , updateApplicationStatus } from "../controllers/application.controller.js";

const router = Router();

router.route("/me").get(verifyJWT , getMyApplications);
router.patch("/:applicationId/status", verifyJWT, updateApplicationStatus);
export default router