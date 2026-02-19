import mongoose, {Schema} from "mongoose";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    salary: {
      type: Number,
    },
    jobOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  } , {
    timestamps: true
  }
)

export const Job = mongoose.model("Job",jobSchema)