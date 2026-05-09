import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema({
  email: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Newsletter ||
  mongoose.model("Newsletter", newsletterSchema);