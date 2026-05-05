import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Ordermodel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import productmodel from "@/models/productmodel";
import { stripe } from "@/lib/stripe";
import Cartmodel from "@/models/Cartmodel";

export async function POST(req) {
  await dbConnect();
 // first step authorization
  const session = await getServerSession(authOptions);
  console.log(session)
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
 // get data from body
  try {
    const { items, address, paymentMethod } = await req.json();
    console.log("items from back", items)

    if (!items || items.length === 0) {
      return Response.json({ message: "Cart is empty" }, { status: 400 });
    }
   // get all proucts ids and all from db
    const productIds = items.map((i) => i.productId);
    const products = await productmodel.find({ _id: { $in: productIds } });
    let totalPrice = 0;
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
    /*********************************
      CASH ON DELIVERY FLOW
     *********************************/
    if (paymentMethod === "cash") {
      
      const order = await Order.create({
        userId: session.user.id,
        items: orderItems,
        address:address,
        paymentMethod,
        totalPrice,
        paymentStatus: "pending",
      });
      
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
      await Cartmodel.findOneAndDelete(
        { userId: session.user.id }
      );

      // send email 
      await fetch("https://esraaabdo.app.n8n.cloud/webhook-test/c47abab5-2ac1-46f8-931d-0bf98aa898d8", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
        body: JSON.stringify({
    email :session.user.email,
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
});
      return Response.json({ order });
    }

    /*********************************
     * 💳 STRIPE FLOW
     *********************************/
    if (paymentMethod === "credit_card") {
      const sessionStripe = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",

        metadata: {
          userId: session.user.id,
          address: JSON.stringify(address),
          items: JSON.stringify(orderItems),
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

      return Response.json({
        url: sessionStripe.url,
      });
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
export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const orders = await Order.find({ userId: session.user.id })
    .populate("items.productId")
    .sort({ createdAt: -1 });

  return Response.json(  { message: "Orders fetched successfully", orders },
    { status: 200 });
}
