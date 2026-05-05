import dbConnect from "@/lib/dbConnect";
import productmodel from "@/models/productmodel";

export async function GET( req,{ params }) {
  await dbConnect();


 const { id } = await params;


  try {
 const product = await productmodel.findById(id);

    if (!product) {
      return Response.json(
        { message: "product not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "product fetched successfully",
        data: product,
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
  const product = await productmodel.findOneAndDelete({ _id: id });

    if (!product) {
      return Response.json(
        { message: "product not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "product deleted successfully",
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

  const { id } =await params;

  const formData = await req.formData(); 

  const body = Object.fromEntries(formData); 

  try {
    const product = await productmodel.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!product) {
      return Response.json(
        { message: "product not found" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "product updated successfully",
      data: product,
    });
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