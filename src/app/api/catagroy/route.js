import dbConnect from "@/lib/dbConnect";
import Cataroymodel from "@/models/Cataroymodel";

export async function POST(req) {

  await dbConnect();

  const { name } = await req.json();

  if (!name || name.length <2) {
    return Response.json(
      { message: "Name must be at least 2 characters" },
      { status: 400 }
    );
  }
  const existingcatagroy = await Cataroymodel.findOne({ name });

  if (existingcatagroy) {
    return Response.json(
      { message: "catagroy already exists" },
      { status: 400 }
    );
  }


  const catagroy = await Cataroymodel.create({
    name
  });



  return Response.json(
  { message: "catagroy created successfully", data: { catagroy }},
  { status: 201 }
  );
}
export async function GET() {
  await dbConnect();

  try {
    const categories = await Cataroymodel.find();
    console.log(categories)

    return Response.json(
      {
        message: "Categories fetched successfully",
        data: categories,
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