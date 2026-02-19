import "./config/env.js";
import { app } from "./app.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 5000;

connectDB()
.then(() => {
  module.exports = app;
})
.catch((err) => {
  console.log("MongoDb connection failed !!!" , err)
})