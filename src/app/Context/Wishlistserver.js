

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import "@/models/productmodel";
import { getServerSession } from "next-auth";
import Usermodel from "@/models/Usermodel";


export async function getInitialwishlist(page = 1, limit = 3) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    await dbConnect();

    const user = await Usermodel.findById(session.user.id)
      .populate("wishlist")
      .lean();

    const totalItems = user.wishlist.length;
    const totalPages = Math.ceil(totalItems / limit);

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedWishlist = user.wishlist.slice(start, end);

    return {
      items: paginatedWishlist.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      totalPages,
      currentPage: page,
    };
  } catch (err) {
    console.error("getInitialWishlist error:", err);
    return null;
  }
}