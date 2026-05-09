import dbConnect from "@/lib/dbConnect";
import Cataroymodel from "@/models/Cataroymodel";
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

export async function POST(req) {
       const session = await requireAdmin();
  if (!session) return forbidden();

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
  const session = await requireAdmin();
  if (!session) return forbidden();
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