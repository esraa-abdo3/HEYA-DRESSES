import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Ordermodel";

export async function getMyOrders() {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session) {
    return
  }

  const orders = await Order.find({ userId: session.user.id })
    .populate("items.productId")
        .sort({ createdAt: -1 })
        .lean()


  return orders.map(order => ({
    ...order,
    _id: order._id.toString(),
    userId: order.userId.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),

    items: order.items.map(item => ({
      ...item,
      _id: item._id.toString(),
      productId: {
        ...item.productId,
        _id: item.productId._id.toString(),
      }
    }))
  }));
}
