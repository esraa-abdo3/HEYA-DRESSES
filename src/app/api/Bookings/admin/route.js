import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Bookingmodel";
import productmodel from "@/models/productmodel";
import { requireAdmin, forbidden } from "@/lib/requireAdmin";

// GET /api/Bookings/admin -> full list of bookings for the dashboard
export async function GET(req) {
  const session = await requireAdmin();
  if (!session) return forbidden();

  await dbConnect();

  try {
    const bookings = await Booking.find({})
      .populate("productId")
      .sort({ bookingDate: -1, createdAt: -1 })
      .lean();

    return Response.json({ data: bookings ,count: bookings.length }, { status: 200 });
  } catch (error) {
    console.error("Bookings admin GET error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

// POST /api/Bookings/admin -> admin manually books a product for a customer
export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return forbidden();

  await dbConnect();

  try {
    const {
      productId,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      bookingDate,
      note,
    } = await req.json();

    if (!productId || !customerName || !customerPhone || !bookingDate || !customerAddress) {
      return Response.json(
        {
          message:
            "productId, customerName, customerAddress, customerPhone and bookingDate are required",
        },
        { status: 400 }
      );
    }

    const product = await productmodel.findById(productId);
    if (!product) {
      return Response.json({ message: "Product not found" }, { status: 404 });
    }
     // vaild date or not 
    const dayStart = new Date(bookingDate);
    if (isNaN(dayStart.getTime())) {
      return Response.json({ message: "Invalid booking date" }, { status: 400 });
    }
    const dayKey = dayStart.toISOString().slice(0, 10);

   const todayKey = new Date().toISOString().slice(0, 10);
    if (dayKey < todayKey) {
      return Response.json(
        { message: "Booking date cannot be in the past" },
        { status: 400 }
      );
    }
    // prevent double-booking the same product on the same day
    const alreadyBooked = (product.bookedDates || []).some(
      (d) => new Date(d).toISOString().slice(0, 10) === dayKey
    );
    if (alreadyBooked) {
      return Response.json(
        { message: "This product is already booked on this date" },
        { status: 409 }
      );
    }

    const booking = await Booking.create({
      productId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      customerAddress: customerAddress || "",
      bookingDate: dayStart,
      price: product.price,
      paymentStatus: "pending",
      note: note || "",
    });

    // keep the product's own bookedDates list in sync
    product.bookedDates.push(dayStart);
    await product.save();

    await booking.populate("productId");

    return Response.json(
      { message: "Booking created successfully", data: booking },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bookings admin POST error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
