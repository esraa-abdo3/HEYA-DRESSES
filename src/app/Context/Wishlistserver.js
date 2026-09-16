
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import "@/models/productmodel";
import { getServerSession } from "next-auth";
import Wishlist from "@/models/Wishlistmodel";

export async function getInitialwishlist() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        items: [],
      };
    }

    await dbConnect();

    const wishlist = await Wishlist.findOne({ userId: session.user.id })
      .populate("items")
      .lean();

    const allItems = wishlist?.items || [];

    return {
      items: allItems.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
    };
  } catch (err) {
    console.log("ERROR:", err);
    return {
      items: [],
    };
  }
}
