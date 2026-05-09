export const runtime = "nodejs";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Ordermodel";
import Cart from "@/models/Cartmodel";
import productmodel from "@/models/productmodel";
import { stripe } from "@/lib/stripe";

export async function POST(req) {
  try {
    console.log("🚀 WEBHOOK HIT");

    await dbConnect();

    const body = await req.text();
    const sig =  req.headers.get("stripe-signature" );



    let event;

    try {
      event =
        stripe.webhooks.constructEvent(
          body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
      console.log(
        "❌ WEBHOOK ERROR",
        err.message
      );

      return new Response(
        "Webhook Error",
        {
          status: 400,
        }
      );
    }
    console.log("BODY:", body);


    /*********************************
     * 💳 PAYMENT SUCCESS
     *********************************/
    if (
      event.type ===
      "checkout.session.completed"
    ) {
      console.log(
        "✅ PAYMENT SUCCESS"
      );

      const session =
        event.data.object;

      const userId =
        session.metadata.userId ||
        null;

      const guestId =
        session.metadata.guestId ||
        null;

      const items = JSON.parse(
        session.metadata.items ||
          "[]"
      );

      const address = JSON.parse(
        session.metadata.address
      );

      const discount = Number(
        session.metadata.discount ||
          0
      );

   const email =
  session.customer_details?.email ||
  session.metadata.email ||
  "guest@guest.com";

      /*********************************
       * 🧾 PREVENT DUPLICATE ORDERS
       *********************************/
      const existingOrder =
        await Order.findOne({
          transactionId: session.id,
        });

      if (existingOrder) {
        return new Response(
          "Order already exists",
          {
            status: 200,
          }
        );
      }

      /*********************************
       * 💰 TOTAL PRICE
       *********************************/
      let totalPrice =
        items.reduce(
          (acc, item) =>
            acc +
            item.price *
              item.quantity,
          0
        );

      totalPrice =
        totalPrice -
        (totalPrice * discount) /
          100;

      /*********************************
       * 📦 UPDATE STOCK
       *********************************/
      for (const item of items) {
        await productmodel.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              stock:
                -item.quantity,
            },
          }
        );
      }

      /*********************************
       * 🧾 CREATE ORDER
       *********************************/
      const order =
        await Order.create({
          userId:
            userId || null,

          guestId: userId
            ? null
            : guestId,

          items,

          address,

          paymentMethod:
            "credit_card",

          paymentProvider:
            "stripe",

          totalPrice,

          paymentStatus:
            "paid",

          transactionId:
            session.id,
        });

      console.log(
        "✅ ORDER CREATED",
        order._id
      );

      /*********************************
       * 🛒 CLEAR CART
       *********************************/
      if (userId) {
        await Cart.findOneAndUpdate(
          { userId },
          {
            $set: {
              items: [],
            },
          }
        );
      } else if (guestId) {
        await Cart.findOneAndUpdate(
          { guestId },
          {
            $set: {
              items: [],
            },
          }
        );
      }

      /*********************************
       * 📧 SEND EMAIL
       *********************************/
      try {
        const enrichedItems =
          await Promise.all(
            items.map(
              async (item) => {
                const product =
                  await productmodel.findById(
                    item.productId
                  );

                return {
                  name:
                    product?.name,
                  image:
                    product?.image,
                  price:
                    item.price,
                  quantity:
                    item.quantity,
                };
              }
            )
          );

        await fetch(
          "https://esraaabdo.app.n8n.cloud/webhook/c47abab5-2ac1-46f8-931d-0bf98aa898d8",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              items:
                enrichedItems,
              total:
                totalPrice,
              address,
            }),
          }
        );

        console.log(
          "✅ EMAIL SENT"
        );
      } catch (err) {
        console.log(
          "❌ EMAIL ERROR",
          err
        );
      }
    }

    return new Response(
      "success",
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(
      "❌ WEBHOOK SERVER ERROR",
      error
    );

    return new Response(
      "Server Error",
      {
        status: 500,
      }
    );
  }
}