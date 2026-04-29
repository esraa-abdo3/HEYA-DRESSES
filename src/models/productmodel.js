
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    image: String,
    category: String,
    stock: Number,

    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);