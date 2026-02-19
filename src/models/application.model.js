import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    jobTitle: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    appliedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appliedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);


export const Application = mongoose.model("Application", applicationSchema);
