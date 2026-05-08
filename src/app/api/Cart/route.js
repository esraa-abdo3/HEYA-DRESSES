import dbConnect from "@/lib/dbConnect";
import Cart from "../../../models/Cartmodel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
export async function POST(req) {
  await dbConnect();

  const session = await getServerSession(authOptions);



const userId = session?.user?.id || null;
const { productId ,guestId} = await req.json();
  let cart
  //  Logged in user
  if (userId) {
    cart = await Cart.findOne({ userId });
  }
  // gest user
   else {
    cart = await Cart.findOne({ guestId });
  }

  if (!cart) {
    cart = new Cart({
      userId: userId || null,
      guestId: userId ? null : guestId,
      items: [{ productId, quantity: 1 }],
    });
  } else {
const itemIndex = cart.items.findIndex(
  (item) => item.productId.toString() === productId
);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }
  }

  await cart.save();

  return Response.json({ message: "Added to cart", cart });
}


// export async function GET(req) {
//   await dbConnect();

//   const session = await getServerSession(authOptions);

//   if (!session) {
//     return Response.json({ cart: { items: [] } }, { status: 401 });
//   }

//   const userId = session.user.id;

//   const cart = await Cart.findOne({ userId }).populate("items.productId");

//   return Response.json({ cart });
// }
export async function GET(req) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;

  const guestId = req.nextUrl.searchParams.get("guestId");

  let cart;

  if (userId) {
    cart = await Cart.findOne({ userId }).populate("items.productId");
  } else if (guestId) {
    cart = await Cart.findOne({ guestId }).populate("items.productId");
  }

  return Response.json({ cart: cart || { items: [] } });
}


export async function PATCH(req) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;

  const { productId, action, guestId } = await req.json();

  let cart;

  if (userId) {
    cart = await Cart.findOne({ userId });
  } else {
    cart = await Cart.findOne({ guestId });
  }

  if (!cart) {
    return Response.json({ message: "Cart not found" }, { status: 404 });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    if (action === "inc") {
      cart.items[itemIndex].quantity += 1;
    }

    if (action === "dec") {
      cart.items[itemIndex].quantity -= 1;

      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    }
  }

  await cart.save();

  return Response.json({ message: "Cart updated", cart });
}

export async function DELETE(req) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const { productId, guestId } = await req.json();

  let cart;

  if (userId) {
    cart = await Cart.findOne({ userId });
  } else {
    cart = await Cart.findOne({ guestId });
  }

  if (!cart) {
    return Response.json({ message: "Cart not found" }, { status: 404 });
  }

  // 🗑 remove item only
  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  await cart.save();

  return Response.json({ message: "Item removed", cart });
}