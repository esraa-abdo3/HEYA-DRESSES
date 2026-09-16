import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Bookingmodel";
import productmodel from "@/models/productmodel";
import { requireAdmin, forbidden } from "@/lib/requireAdmin";

const ACTIVE_STATUSES = ["pending", "paid"];
const dayKeyOf = (date) => new Date(date).toISOString().slice(0, 10);

// PATCH /api/Bookings/admin/[id]/complete
// mark a booking as completed and free its date on the product
export async function PATCH(req, { params }) {
  const session = await requireAdmin();
  if (!session) return forbidden();

  await dbConnect();
  const { id } = await params;

  try {
    const existing = await Booking.findById(id);
    if (!existing) {
      return Response.json({ message: "Booking not found" }, { status: 404 });
    }

    if (existing.paymentStatus === "completed") {
      return Response.json(
        { message: "Booking is already completed" },
        { status: 400 }
      );
    }

    if (existing.paymentStatus === "cancelled") {
      return Response.json(
        { message: "Cannot complete a cancelled booking" },
        { status: 400 }
      );
    }

    const wasActive = ACTIVE_STATUSES.includes(existing.paymentStatus);
    const dayKey = dayKeyOf(existing.bookingDate);

    const booking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus: "completed" },
      { new: true }
    );



      const product = await productmodel.findById(booking.productId);
      if (product) {
        product.bookedDates = (product.bookedDates || []).filter(
          (d) => dayKeyOf(d) !== dayKey
        );
        await product.save();
      }
    

    const populated = await booking.populate("productId");

    return Response.json(
      { message: "Booking completed successfully", data: populated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Booking complete error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}