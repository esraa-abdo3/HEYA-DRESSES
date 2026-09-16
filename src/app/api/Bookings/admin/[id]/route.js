import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Bookingmodel";
import productmodel from "@/models/productmodel";
import { requireAdmin, forbidden } from "@/lib/requireAdmin";

const ACTIVE_STATUSES = ["pending", "paid"];
const dayKeyOf = (date) => new Date(date).toISOString().slice(0, 10);


// GET /api/Bookings/admin/[id]
// fetch a single booking with full details
export async function GET(req, { params }) {
  const session = await requireAdmin();
  if (!session) return forbidden();

  await dbConnect();
  const { id } = await params;

  try {
    const booking = await Booking.findById(id).populate("productId").lean();

    if (!booking) {
      return Response.json({ message: "Booking not found" }, { status: 404 });
    }

    return Response.json({ data: booking }, { status: 200 });
  } catch (error) {
    console.error("Booking GET (single) error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}


// PATCH /api/Bookings/admin/[id]
// update customer info / note / bookingDate / paymentStatus
export async function PATCH(req, { params }) {
  const session = await requireAdmin();
  if (!session) return forbidden();

  await dbConnect();
  const { id } = await params;

  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      note,
      bookingDate,
      paymentStatus,
    } = await req.json();

    const existing = await Booking.findById(id);
    if (!existing) {
      return Response.json({ message: "Booking not found" }, { status: 404 });
    }
  if (existing.paymentStatus === "completed") {
  return Response.json(
    { message:"Cannot modify a completed book." },
    { status: 400 }
  );
}

    const oldDateKey = dayKeyOf(existing.bookingDate);
    const oldWasActive = ACTIVE_STATUSES.includes(existing.paymentStatus);

    const update = {};
    if (customerName !== undefined) update.customerName = customerName;
    if (customerPhone !== undefined) update.customerPhone = customerPhone;
    if (customerEmail !== undefined) update.customerEmail = customerEmail;
    if (customerAddress !== undefined) update.customerAddress = customerAddress;
    if (note !== undefined) update.note = note;

    let newDate = existing.bookingDate;
    if (bookingDate !== undefined) {
      newDate = new Date(bookingDate);
      if (isNaN(newDate.getTime())) {
        return Response.json({ message: "Invalid booking date" }, { status: 400 });
      }
      const newKey = dayKeyOf(newDate);
      const todayKey = dayKeyOf(new Date());
      if (newKey < todayKey) {
        return Response.json({ message: "Booking date cannot be in the past" }, { status: 400 });
      }
      update.bookingDate = newDate;
    }

    // الحالة الفعّالة بعد التعديل (لو paymentStatus هيتغير أو هيفضل زي ما هو)
    const willBeActive = paymentStatus
      ? ACTIVE_STATUSES.includes(paymentStatus)
      : oldWasActive;

    const newKey = dayKeyOf(newDate);

    // لو التاريخ هيتغير أو الحجز هيبقى فعّال، لازم نتأكد إن مفيش حجز فعّال تاني
    // لنفس المنتج في نفس اليوم الجديد (باستثناء الحجز ده نفسه)
    if (willBeActive && (newKey !== oldDateKey || !oldWasActive)) {
      const conflict = await Booking.findOne({
        _id: { $ne: id },                     // استبعاد الحجز الحالي نفسه
        productId: existing.productId,
        paymentStatus: { $in: ACTIVE_STATUSES },
        bookingDate: {
          $gte: new Date(`${newKey}T00:00:00.000Z`),
          $lt: new Date(`${newKey}T23:59:59.999Z`),
        },
      });

      if (conflict) {
        return Response.json(
          { message: "This product is already booked on this date" },
          { status: 409 }
        );
      }
    }

    if (paymentStatus) update.paymentStatus = paymentStatus;

    let booking = await Booking.findByIdAndUpdate(id, update, { new: true });

    const newDateKey = dayKeyOf(booking.bookingDate);
    const newIsActive = ACTIVE_STATUSES.includes(booking.paymentStatus);

    // keep the product's bookedDates in sync with the booking's real state
    if (oldDateKey !== newDateKey || oldWasActive !== newIsActive) {
      const product = await productmodel.findById(booking.productId);

      if (product) {
        if (oldWasActive) {
          product.bookedDates = (product.bookedDates || []).filter(
            (d) => dayKeyOf(d) !== oldDateKey
          );
        }

        if (
          newIsActive &&
          !product.bookedDates.some((d) => dayKeyOf(d) === newDateKey)
        ) {
          product.bookedDates.push(booking.bookingDate);
        }

        await product.save();
      }
    }

    booking = await booking.populate("productId");

    return Response.json(
      { message: "Booking updated successfully", data: booking },
      { status: 200 }
    );
  } catch (error) {
    console.error("Booking PATCH error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/Bookings/admin/[id]
// cancel/delete a booking and free up the date on the product
// export async function DELETE(req, { params }) {
//   const session = await requireAdmin();
//   if (!session) return forbidden();

//   await dbConnect();
//   const { id } = await params;

//   try {
//     const booking = await Booking.findByIdAndDelete(id);
//     if (!booking) {
//       return Response.json({ message: "Booking not found" }, { status: 404 });
//     }

//     const dayKey = dayKeyOf(booking.bookingDate);
//     const product = await productmodel.findById(booking.productId);
//     if (product) {
//       product.bookedDates = (product.bookedDates || []).filter(
//         (d) => dayKeyOf(d) !== dayKey
//       );
//       await product.save();
//     }

//     return Response.json(
//       { message: "Booking deleted successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Booking DELETE error:", error);
//     return Response.json({ message: "Server error" }, { status: 500 });
//   }
// }

export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return forbidden();

  await dbConnect();
  const { id } = await params;

  try {
    const existing = await Booking.findById(id);
    if (!existing) {
      return Response.json({ message: "Booking not found" }, { status: 404 });
    }

    // already cancelled? nothing to do
    if (existing.paymentStatus === "cancelled") {
      return Response.json(
        { message: "Booking is already cancelled" },
        { status: 400 }
      );
    }
    if (existing.paymentStatus === "completed") {
  return Response.json(
    { message: "A completed booking cannot be cancelled." },
    { status: 400 }
  );
}

    const wasActive = ACTIVE_STATUSES.includes(existing.paymentStatus);
    const dayKey = dayKeyOf(existing.bookingDate);

    const booking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus: "cancelled" },
      { new: true }
    );

    // free up the date on the product only if it was actually holding it

      const product = await productmodel.findById(booking.productId);
      if (product) {
        product.bookedDates = (product.bookedDates || []).filter(
          (d) => dayKeyOf(d) !== dayKey
        );
        await product.save();
      }
    

    const populated = await booking.populate("productId");

    return Response.json(
      { message: "Booking cancelled successfully", data: populated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Booking cancel error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

