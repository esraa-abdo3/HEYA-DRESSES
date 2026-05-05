import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Ordermodel";
import Cart from "@/models/Cartmodel";
import { stripe } from "@/lib/stripe";

export async function POST(req) {
  await dbConnect();

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response("Webhook Error", { status: 400 });
  }

  /******************************
   * 💳 PAYMENT SUCCESS
   ******************************/
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata.userId;
    const items = JSON.parse(session.metadata.items);
    const address = JSON.parse(session.metadata.address);

    const totalPrice = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // 🧾 Create Order
    await Order.create({
      userId,
      items,
      address,
      paymentMethod: "credit_card",
      totalPrice,
      paymentStatus: "paid",
      transactionId: session.id,
    });

    // 🧹 clear cart
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }
    );
  }

  return new Response("success", { status: 200 });
}