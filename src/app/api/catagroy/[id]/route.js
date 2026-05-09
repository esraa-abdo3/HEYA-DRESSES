import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Cataroymodel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
function forbidden() {
  return Response.json(
    { message: "Forbidden: Admins only" },
    { status: 403 }
  );
}
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") return null;
  return session;
}

export async function GET( req,{ params }) {
  await dbConnect();
    const session = await requireAdmin();
  if (!session) return forbidden();

 const { id } = await params;


  try {
 const category = await Category.findById(id);

    if (!category) {
      return Response.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "Category fetched successfully",
        data: category,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
export async function DELETE(req, { params }) {
     const session = await requireAdmin();
  if (!session) return forbidden();
  await dbConnect();

 const { id } = await params;
  try {
  const category = await Category.findOneAndDelete({ _id: id });

    if (!category) {
      return Response.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "Category deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
export async function PUT(req, { params }) {
     const session = await requireAdmin();
  if (!session) return forbidden();
  await dbConnect();

 const { id } = await params;
  const { name } = await req.json();

  if (!name || name.length < 2) {
    return Response.json(
      { message: "Category name is required" },
      { status: 400 } 
    );
  }

  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!category) {
      return Response.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "Category updated successfully",
        data: category,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}