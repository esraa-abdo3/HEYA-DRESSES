import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Ordermodel";

// GET /api/Bookings?month=YYYY-MM
// returns { [productId]: ["YYYY-MM-DD", ...] } for every product that has an
// active (pending/paid) booking within that month. Used on the storefront to
// show whether a product is booked today / this month.
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month"); // "YYYY-MM"

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-indexed

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-").map(Number);
      year = y;
      month = m - 1;
    }

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const orders = await Order.find({
      bookingDate: { $gte: start, $lt: end },
      paymentStatus: { $in: ["pending", "paid"] },
    })
      .select("items.productId bookingDate")
      .lean();

    const bookedDates = {};

    for (const order of orders) {
      const dateStr = new Date(order.bookingDate).toISOString().slice(0, 10);
      for (const item of order.items) {
        const productId = item.productId?.toString();
        if (!productId) continue;
        if (!bookedDates[productId]) bookedDates[productId] = [];
        if (!bookedDates[productId].includes(dateStr)) {
          bookedDates[productId].push(dateStr);
        }
      }
    }

    return Response.json({ bookedDates });
  } catch (err) {
    console.error("Bookings GET error:", err);
    return Response.json({ message: "Server Error" }, { status: 500 });
  }
}
