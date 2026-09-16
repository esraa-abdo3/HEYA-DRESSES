import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Bookingmodel";

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

    const bookings = await Booking.find({
      bookingDate: { $gte: start, $lt: end },
      paymentStatus: { $in: ["pending", "paid"] },
    })
      .select("productId bookingDate")
      .lean();

    const bookedDates = {};

    for (const booking of bookings) {
      const productId = booking.productId?.toString();
      if (!productId) continue;

      const dateStr = new Date(booking.bookingDate).toISOString().slice(0, 10);

      if (!bookedDates[productId]) bookedDates[productId] = [];
      if (!bookedDates[productId].includes(dateStr)) {
        bookedDates[productId].push(dateStr);
      }
    }

    return Response.json({ bookedDates });
  } catch (err) {
    console.error("Bookings GET error:", err);
    return Response.json({ message: "Server Error" }, { status: 500 });
  }
}
