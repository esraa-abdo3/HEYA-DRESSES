
import dbConnect from "@/lib/dbConnect";
import PromoCode from "@/models/Promocodemodel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  await dbConnect();

  const session = await getServerSession(authOptions);
console.log(session)
  // check login
  if (!session) {
    return Response.json(
      { message: "Unauthorized" ,
       status: 401 }
    );
  }

  // admin only
  if (session.user.role !== "admin") {
    return Response.json(
      { message: "Forbidden" ,
       status: 403 }
    );
  }

  try {
      const body = await req.json();
      
if (!body.name || !body.discount) {
  return Response.json(
    { message: "All fields are required" ,
     status: 400 }
  );
}
  const existpromocode = await PromoCode.findOne({ name: body.name});

if (existpromocode) {
  return Response.json({
    message: "promocode already exists",
    data: [],
    status: 400
  });
}
    const promo = await PromoCode.create({
      name: body.name,
      discount: body.discount,
      createdBy: session.user.id,
    });

 return Response.json({ message: "promocode added sucessfully" , data:promo, status:201});
  } catch (error) {
    return Response.json(
      { message: error.message ,
       status: 500 }
    );
  }
}
export async function GET(req) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);


      



    const promos = await PromoCode.find().sort({ createdAt: -1 });

    return Response.json({
      message: "success",
      data: promos,
      status: 200
    });

  } catch (error) {
    return Response.json({
      message: error.message,
      status: 500
    });
  }
}