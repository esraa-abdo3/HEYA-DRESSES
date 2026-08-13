import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Ordermodel";
import "@/models/productmodel";
import "@/models/Usermodel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function forbidden() {
  return Response.json(
    { message: "Forbidden: Admins only" },
    { status: 403 }
  );
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") return null;
  return session;
}

// GET /api/Bookings/admin  -> full list of bookings for the dashboard
export async function GET(req) {
  const session = await requireAdmin();
  if (!session) return forbidden();

  await dbConnect();

  try {
    const bookings = await Order.find({})
      .populate("items.productId")
      .populate("userId", "username email")
      .sort({ bookingDate: -1, createdAt: -1 })
      .lean();

    return Response.json({ data: bookings }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
