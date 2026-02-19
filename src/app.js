import express, { application } from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

console.log("app.js LOADED");

export const app = express();
app.use(cors({
  // Hardcode this for now to ensure it works
  origin: "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

import userRouter from './routers/user.routes.js'
import jobRouter from './routers/job.routes.js'
import applicationRouter from './routers/applications.routes.js'

app.use("/api/v1/users", userRouter)
app.use("/api/v1/jobs" , jobRouter)
app.use("/api/v1/applications" , applicationRouter)

app.get("/", (req, res) => {
  res.send("API running");
});
