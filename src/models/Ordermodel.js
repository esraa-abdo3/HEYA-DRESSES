import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    address: {
      name: { type: String, required: true },
      street: { type: String, required: true },
      building: { type: String, required: true },
      phone: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "cash", "wallet"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    totalPrice: {
      type: Number,
      required: true,
    },
    promocode: {
      type:String,
    },

    transactionId: {
      type: String,
    },

    paymentProvider: {
      type: String,
      enum: ["stripe", "paypal", "wallet", "manual"],
      default: "manual",
    },

  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);