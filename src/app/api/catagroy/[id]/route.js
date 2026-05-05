import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Cataroymodel";

export async function GET( req,{ params }) {
  await dbConnect();
  console.log(params)

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