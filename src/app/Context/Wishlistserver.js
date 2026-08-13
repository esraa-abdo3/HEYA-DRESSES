
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import "@/models/productmodel";
import { getServerSession } from "next-auth";
import Wishlist from "@/models/Wishlistmodel";

export async function getInitialwishlist(page = 1, limit = 3) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        items: [],
        totalPages: 1,
        currentPage: 1,
      };
    }

    await dbConnect();

    const wishlist = await Wishlist.findOne({ userId: session.user.id })
      .populate("items")
      .lean();

    const allItems = wishlist?.items || [];

    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedWishlist = allItems.slice(start, end);

    return {
      items: paginatedWishlist.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      totalPages,
      currentPage: page,
    };
  } catch (err) {
    console.log("ERROR:", err);
    return {
      items: [],
      totalPages: 1,
      currentPage: 1,
    };
  }
}
