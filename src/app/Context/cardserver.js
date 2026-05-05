

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cartmodel";
import "@/models/productmodel";
import { getServerSession } from "next-auth";

export async function getInitialCart() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return [];

    await dbConnect();

    const cart = await Cart.findOne({ userId: session.user.id })
      .populate("items.productId")
      .lean();

    const items = cart?.items || [];

    const cleanCart = items
      .filter(item => item?.productId?._id) // 🔥 حماية كاملة
      .map((item) => ({
        _id: item._id?.toString(),
        quantity: item.quantity,
        productId: {
          ...item.productId,
          _id: item.productId._id?.toString(),
          category: item.productId.category?.toString() || null,
        },
      }));
console.log("from fetch",cleanCart)
    return cleanCart;

  } catch (err) {
    console.error("getInitialCart error:", err);
    return [];
  }
}