import dbConnect from "@/lib/dbConnect";
import User from "@/models/Usermodel";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";


export async function POST(req) {
    await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
       }
      const userId = session.user.id;
      const {  productId } = await req.json();
      const user = await User.findById(userId);

      if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
     }

  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }

  return Response.json({ message: "Added to wishlist", wishlist: user.wishlist });
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 3;
    const page = parseInt(searchParams.get("page")) || 1;

    const skip = limit * (page - 1);

    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await User.findById(userId).populate("wishlist").lean();

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const totalItems = user.wishlist.length;
    const totalPages = Math.ceil(totalItems / limit);

    const items = user.wishlist.slice(skip, skip + limit);

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
      if (!session) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
       }
      const userId = session.user.id;
      const { productId } = await req.json();
      const user = await User.findById(userId);

     if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
user.wishlist = user.wishlist.filter(
  (id) => id.toString() !== productId
);

  await user.save();

  return Response.json({ message: "Removed from wishlist", wishlist: user.wishlist });
}