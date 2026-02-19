import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


export const connectDB = async () => {
  let isConnected = false;
  try {
    const connectionInstance = await mongoose.connect(`${process.env.
    MONGODB_URI}/${DB_NAME}`)
    isConnected = true;
    console.log(`\n MongoDB connected successfully !! DB HOST:
      ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("ERROR: ", error);
    process.exit(1)
  }
}
