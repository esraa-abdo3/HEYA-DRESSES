import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    priceAfterDiscount: {
      type: Number,
      default: null,
      validate: {
        validator: function (value) {
          if (value == null) return true;
  
          if (this.price == null) return true;
          return value < this.price;
        },
        message: "The offer price must be lower than the original price.",
      },
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length >= 1 && value.length <= 5;
        },
        message: "Product must have between 1 and 5 images.",
      },
    },

    stock: {
      type: Number,
      default: 1,
    },

    // days (this product) is already booked/rented on — attached directly to the product
    // so the storefront can show them to the customer right away.
    bookedDates: {
      type: [Date],
      default: [],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    isNew: {
      type: Boolean,
      default: false,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);