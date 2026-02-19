import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ✅ CONFIG MUST BE TOP-LEVEL (NO IIFE)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("CLOUDINARY ENV CHECK:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // 🔴 normalize Windows path
    const normalizedPath = localFilePath.replace(/\\/g, "/");

    const response = await cloudinary.uploader.upload(normalizedPath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("CLOUDINARY UPLOAD ERROR >>>", error);
    throw error
  }
};

export { uploadOnCloudinary };
