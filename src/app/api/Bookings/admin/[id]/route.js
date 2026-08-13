import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Ordermodel";
import productmodel from "@/models/productmodel";
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

// PATCH /api/Bookings/admin/[id]  -> update note / bookingDate / paymentStatus
export async function PATCH(req, { params }) {
  const session = await requireAdmin();
  if (!session) return forbidden();

  await dbConnect();
  const { id } = await params;

  try {
    const { note, bookingDate, paymentStatus } = await req.json();

    const existing = await Order.findById(id);
    if (!existing) {
      return Response.json({ message: "Booking not found" }, { status: 404 });
    }

    const ACTIVE_STATUSES = ["pending", "paid"];
    const oldDateKey = new Date(existing.bookingDate).toISOString().slice(0, 10);
    const oldWasActive = ACTIVE_STATUSES.includes(existing.paymentStatus);

    const update = {};
    if (note !== undefined) update.note = note;
    if (bookingDate) update.bookingDate = new Date(bookingDate);
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const booking = await Order.findByIdAndUpdate(id, update, { new: true })
      .populate("items.productId")
      .populate("userId", "username email");

    const newDateKey = new Date(booking.bookingDate).toISOString().slice(0, 10);
    const newIsActive = ACTIVE_STATUSES.includes(booking.paymentStatus);

    // keep each product's bookedDates in sync with the booking's real state
    if (oldDateKey !== newDateKey || oldWasActive !== newIsActive) {
      for (const item of booking.items) {
        const productId = item.productId?._id || item.productId;
        const product = await productmodel.findById(productId);
        if (!product) continue;

        if (oldWasActive) {
          product.bookedDates = (product.bookedDates || []).filter(
            (d) => new Date(d).toISOString().slice(0, 10) !== oldDateKey
          );
        }
        if (
          newIsActive &&
          !product.bookedDates.some(
            (d) => new Date(d).toISOString().slice(0, 10) === newDateKey
          )
        ) {
          product.bookedDates.push(booking.bookingDate);
        }
        await product.save();
      }
    }

    return Response.json(
      { message: "Booking updated successfully", data: booking },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/Bookings/admin/[id]  -> cancel/delete a booking and restore stock
export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return forbidden();

  await dbConnect();
  const { id } = await params;

  try {
    const booking = await Order.findByIdAndDelete(id);

    if (!booking) {
      return Response.json({ message: "Booking not found" }, { status: 404 });
    }

    // restore stock and un-book the date for the cancelled booking
    const dayKey = new Date(booking.bookingDate).toISOString().slice(0, 10);
    for (const item of booking.items) {
      const product = await productmodel.findById(item.productId);
      if (!product) continue;

      product.stock += item.quantity;
      product.bookedDates = (product.bookedDates || []).filter(
        (d) => new Date(d).toISOString().slice(0, 10) !== dayKey
      );
      await product.save();
    }

    return Response.json(
      { message: "Booking deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
