import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import PromoCode from "@/models/Promocodemodel";
export async function getAllpromocodes() {
  await dbConnect();

  const session = await getServerSession(authOptions);



    const codes = await  PromoCode.find().lean();
return codes.map(p => ({
  id: p._id.toString(),
  name: p.name,
  discount: p.discount,
}));
}
