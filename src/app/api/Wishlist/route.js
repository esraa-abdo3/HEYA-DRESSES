import dbConnect from "@/lib/dbConnect";
import Wishlist from "@/models/Wishlistmodel";
import "@/models/productmodel";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;
  const { productId, guestId } = await req.json();

  if (!productId) {
    return Response.json({ message: "productId is required" }, { status: 400 });
  }

  let wishlist;

  if (userId) {
    wishlist = await Wishlist.findOne({ userId });
  } else {
    wishlist = await Wishlist.findOne({ guestId });
  }

  if (!wishlist) {
    wishlist = new Wishlist({
      userId: userId || null,
      guestId: userId ? null : guestId,
      items: [productId],
    });
  } else if (!wishlist.items.some((id) => id.toString() === productId)) {
    wishlist.items.push(productId);
  }

  await wishlist.save();

  return Response.json({ message: "Added to wishlist", wishlist: wishlist.items });
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 3;
    const page = parseInt(searchParams.get("page")) || 1;
    const guestId = searchParams.get("guestId");

    const skip = limit * (page - 1);

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    let wishlist;

    if (userId) {
      wishlist = await Wishlist.findOne({ userId }).populate("items").lean();
    } else if (guestId) {
      wishlist = await Wishlist.findOne({ guestId }).populate("items").lean();
    }

    const allItems = wishlist?.items || [];

    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const items = allItems.slice(skip, skip + limit);

    return Response.json({
      items,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error("Wishlist GET error:", err);

    return Response.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;
  const { productId, guestId } = await req.json();

  let wishlist;

  if (userId) {
    wishlist = await Wishlist.findOne({ userId });
  } else {
    wishlist = await Wishlist.findOne({ guestId });
  }

  if (!wishlist) {
    return NextResponse.json({ message: "Wishlist not found" }, { status: 404 });
  }

  wishlist.items = wishlist.items.filter(
    (id) => id.toString() !== productId
  );

  await wishlist.save();

  return Response.json({ message: "Removed from wishlist", wishlist: wishlist.items });
}
