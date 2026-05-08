import dbConnect from "@/lib/dbConnect";
import PromoCode from "@/models/Promocodemodel";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
export async function GET(req, { params }) {
  
    await dbConnect();
     const { id } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ message: "Unauthorized", status: 401 });
      }
        if (session.user.role !== "admin") {
    return Response.json(
      { message: "Forbidden" ,
       status: 403 }
    );
  }


      const promo = await PromoCode.findOne({ _id: id });

    if (!promo) {
      return Response.json({ message: "Not found", status: 404 });
    }

    return Response.json({
      message: "success",
      data: promo,
      status: 200,
    });

  } catch (error) {
    return Response.json({
      message: error.message,
      status: 500,
    });
  }
}
export async function DELETE(req, { params }) {
  await dbConnect();
   const { id } = await params;
  try {
      const session = await getServerSession(authOptions);
          if (!session) {
      return Response.json({ message: "Unauthorized", status: 401 });
      }

    if ( session.user.role !== "admin") {
      return Response.json({ message: "Forbidden", status: 403 });
    }

    const deleted = await PromoCode.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ message: "Not found", status: 404 });
    }

    return Response.json({
      message: "deleted successfully",
      status: 200,
    });

  } catch (error) {
    return Response.json({
      message: error.message,
      status: 500,
    });
  }
}
export async function PUT(req, { params }) {
  await dbConnect();

  const { id } =  await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({
        message: "Unauthorized",
        status: 401,
      });
    }

    if (session.user.role !== "admin") {
      return Response.json({
        message: "Forbidden",
        status: 403,
      });
    }


    let body = {};
    try {
      body = await req.json();
    } catch (error) {
      return Response.json({
        message: "Invalid or empty JSON body",
        status: 400,
      });
    }

  
    const updateData = {};

    if (body.name) {
      updateData.name = body.name.toUpperCase(); 
    }

    if (body.discount) {
      updateData.discount = body.discount;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({
        message: "No data to update",
        status: 400,
      });
    }

    const updated = await PromoCode.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return Response.json({
        message: "Not found",
        status: 404,
      });
    }

    return Response.json({
      message: "updated successfully",
      data: updated,
      status: 200,
    });

  } catch (error) {
    return Response.json({
      message: error.message,
      status: 500,
    });
  }
}