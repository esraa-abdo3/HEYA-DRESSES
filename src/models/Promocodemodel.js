import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
   
    },

    discount: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const PromoCode = mongoose.models.PromoCode || mongoose.model("PromoCode", promoCodeSchema);

export default PromoCode;