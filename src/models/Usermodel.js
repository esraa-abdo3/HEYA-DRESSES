
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
 username: {
        type: String,
        required: [true, "name is required"],
        minLength: [2, "name must be at least 3 characters"],
        maxLength: [20, "name must be less than 20 characters"],
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "please enter a valid email"],
    },
    password: String,
    phone: String,
    address: String,

    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);