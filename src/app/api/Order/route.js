import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Ordermodel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import productmodel from "@/models/productmodel";
import { stripe } from "@/lib/stripe";
import Cartmodel from "@/models/Cartmodel";
import PromoCode from "@/models/Promocodemodel";


export async function POST(req) {
  console.log("start");
  await dbConnect();
 // first step authorization
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;
  console.log("my id", userId)
  
 // get data from body
  try {
    const { items, address, paymentMethod ,promoCode,guestId } = await req.json();
   

    if (!items || items.length === 0) {
      return Response.json({ message: "Cart is empty" }, { status: 400 });
    }
   // get all proucts ids and all from db
    const productIds = items.map((i) => i.productId);
    const products = await productmodel.find({ _id: { $in: productIds } });
    let totalPrice = 0;
    let discount = 0;
        if (promoCode) {
      const promo = await PromoCode.findOne({
        name: promoCode,
      });

      if (promo) {
        discount = promo.discount;
      }
    }



 // then get items [id, quantity, price] and totalprice
    const orderItems = items.map((item) => {
      // then check order exist or not
      const product = products.find(
        (p) => p._id.toString() === item.productId
      );
      if (!product) {
      throw new Error("Product not found: " + item.productId);
      }


      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;


      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    });

  


    totalPrice = totalPrice - (totalPrice * discount / 100);
    /*********************************
      CASH ON DELIVERY FLOW
     *********************************/
    if (paymentMethod === "cash") {
      
      const order = await Order.create({
       userId: userId ||null,
       guestId: userId ? null : guestId,
        items: orderItems,
        address:address,
        paymentMethod,
        totalPrice,
        paymentStatus: "pending",
      });
    console.log("order sent", order)
      
   // manage the stock
      for (const item of items) {
     await productmodel.findByIdAndUpdate(
      item.productId,
      {
      $inc: { stock: -item.quantity }
      }
     );
      }
    // clear cart for user
   if (userId) {
  await Cartmodel.findOneAndDelete({ userId });
} else {
  await Cartmodel.findOneAndDelete({ guestId });
}
console.log("feinish");
      // send email
       fetch("https://esraaabdo.app.n8n.cloud/webhook/c47abab5-2ac1-46f8-931d-0bf98aa898d8", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
        body: JSON.stringify({
    email: session?.user?.email ?? "guest@guest.com",
    items: orderItems.map(item => {
      const product = products.find(p => p._id.toString() === item.productId.toString());

      return {
        name: product.name,
        image: product.image,
        price: item.price,
        quantity: item.quantity,
      };
    }),
    total: totalPrice,
    address,
  }),
       })
        .then(() => console.log("✅ SENT TO N8N"))
  .catch((err) => console.log("❌ N8N ERROR", err));
      console.log("📩 AFTER N8N REQUEST");
      return Response.json({ order });
    }

    /*********************************
     * 💳 STRIPE FLOW
     *********************************/

if (paymentMethod === "credit_card") {
  let stripeDiscounts = [];

  if (discount > 0) {
    const coupon = await stripe.coupons.create({
      percent_off: discount,
      duration: "once",
    });

    stripeDiscounts = [{ coupon: coupon.id }];
  }

  const sessionStripe = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    discounts: stripeDiscounts,
    metadata: {
        userId: userId || null,
       guestId: userId ? null : guestId,
      address: JSON.stringify(address),
      items: JSON.stringify(orderItems),
      discount: discount.toString(),
    },
    line_items: orderItems.map((item) => ({
      price_data: {
        currency: "egp",
        product_data: {
          name: item.productId.toString(),
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    })),
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });

  // ✅ مهم جدًا
  return Response.json({ url: sessionStripe.url });
}
  } catch (error) {
return Response.json(
  {
    message: error.message,
    stack: error.stack
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
