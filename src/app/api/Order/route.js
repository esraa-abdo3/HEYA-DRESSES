import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Ordermodel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import productmodel from "@/models/productmodel";
import Cartmodel from "@/models/Cartmodel";
import PromoCode from "@/models/Promocodemodel";



export async function POST(req) {
  try {
    console.log("🚀 ORDER API START");

    await dbConnect();

    /*********************************
     * 🔐 AUTH
     *********************************/
    const session = await getServerSession(authOptions);

    const userId = session?.user?.id || null;
    const userEmail =
      session?.user?.email || "guest@guest.com";

    /*********************************
     * 📦 REQUEST DATA
     *********************************/
    const {
      items,
      address,
      promoCode,
      guestId,
      bookingDate,
      note,
    } = await req.json();

    if (!items || items.length === 0) {
      return Response.json(
        { message: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!bookingDate) {
      return Response.json(
        { message: "Please choose a booking date" },
        { status: 400 }
      );
    }

    /*********************************
     * 📅 VALIDATE BOOKING DATE
     * must be today or later, and within the current month
     *********************************/
    const chosenDate = new Date(bookingDate);
    if (isNaN(chosenDate.getTime())) {
      return Response.json(
        { message: "Invalid booking date" },
        { status: 400 }
      );
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    if (chosenDate < startOfToday || chosenDate >= startOfNextMonth) {
      return Response.json(
        { message: "Booking date must be within the current month" },
        { status: 400 }
      );
    }

    const dayStart = new Date(
      chosenDate.getFullYear(),
      chosenDate.getMonth(),
      chosenDate.getDate()
    );

    /*********************************
     * 🛍 GET PRODUCTS
     *********************************/
    const productIds = items.map((i) => i.productId);

    const products = await productmodel.find({
      _id: { $in: productIds },
    });

    /*********************************
     * 🚫 CHECK DOUBLE-BOOKING
     * a product already booked for the same day (stored on the product itself)
     * can't be booked again
     *********************************/
    const dayKey = dayStart.toISOString().slice(0, 10);
    const conflictingProduct = products.find((p) =>
      (p.bookedDates || []).some(
        (d) => new Date(d).toISOString().slice(0, 10) === dayKey
      )
    );

    if (conflictingProduct) {
      return Response.json(
        { message: "One or more items are already booked on this date. Please choose another day." },
        { status: 409 }
      );
    }

    let totalPrice = 0;
    let discount = 0;

    /*********************************
     * 🎟 PROMO CODE
     *********************************/
    if (promoCode) {
      const promo = await PromoCode.findOne({
        name: promoCode,
      });

      if (promo) {
        discount = promo.discount;
      }
    }

    /*********************************
     * 🧾 ORDER ITEMS
     *********************************/
    const orderItems = items.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.productId
      );

      if (!product) {
        throw new Error(
          "Product not found: " + item.productId
        );
      }

      const itemTotal =
        product.price * item.quantity;

      totalPrice += itemTotal;

      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    /*********************************
     * 💰 APPLY DISCOUNT
     *********************************/
    totalPrice =
      totalPrice -
      (totalPrice * discount) / 100;

    /*********************************
     * 💵 CASH / RENTAL BOOKING FLOW
     * (payments are cash-only, no card processing)
     *********************************/
    {
      const order = await Order.create({
        userId: userId || null,
        guestId: userId ? null : guestId,
        items: orderItems,
        address,
        paymentMethod: "cash",
        totalPrice,
        paymentStatus: "pending",
        bookingDate: dayStart,
        note: note || "",
      });

      /*********************************
       * 📦 UPDATE STOCK + ATTACH BOOKED DATE TO EACH PRODUCT
       *********************************/
      for (const item of items) {
        await productmodel.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              stock: -item.quantity,
            },
            $addToSet: {
              bookedDates: dayStart,
            },
          }
        );
      }

      /*********************************
       * 🛒 CLEAR CART
       *********************************/
      if (userId) {
        await Cartmodel.findOneAndUpdate(
          { userId },
          { $set: { items: [] } }
        );
      } else if (guestId) {
        await Cartmodel.findOneAndUpdate(
          { guestId },
          { $set: { items: [] } }
        );
      }

      /*********************************
       * 📧 SEND EMAIL
       *********************************/
      try {
        await fetch(
          "https://esraaabdo.app.n8n.cloud/webhook/c47abab5-2ac1-46f8-931d-0bf98aa898d8",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email: userEmail,

              items: orderItems.map((item) => {
                const product = products.find(
                  (p) =>
                    p._id.toString() ===
                    item.productId.toString()
                );

                return {
                  name: product?.name,
                  image: product?.image,
                  price: item.price,
                  quantity: item.quantity,
                };
              }),

              total: totalPrice,
              address,
            }),
          }
        );

        console.log(
          "✅ EMAIL SENT FOR CASH ORDER"
        );
      } catch (err) {
        console.log(
          "❌ EMAIL ERROR",
          err
        );
      }

      return Response.json({
        success: true,
        order,
      });
    }

  } catch (error) {
    console.log("❌ ORDER ERROR", error);

    return Response.json(
      {
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
export async function GET(req) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    const userId = session?.user?.id;
    const guestId = req.nextUrl.searchParams.get("guestId");

    let filter = null;

    if (userId) {
      filter = { userId };
    } else if (guestId) {
      filter = { guestId };
    }

    // لو مفيش لا user ولا guest
    if (!filter) {
      return Response.json({ orders: [] }, { status: 200 });
    }

    const orders = await Order.find(filter)
      .populate("items.productId")
      .sort({ createdAt: -1 });

    return Response.json({ orders }, { status: 200 });
  } catch (err) {
    return Response.json(
      {
        message: "Failed to fetch orders",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
