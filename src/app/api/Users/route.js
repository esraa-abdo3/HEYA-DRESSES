import dbConnect from "@/lib/dbConnect";
import User from "@/models/Usermodel";
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
export async function GET() {
  const session = await requireAdmin();
    if (!session) return forbidden();
    console.log(session)
  await dbConnect();

  try {
    const users = await User.find().select("-password");
    return Response.json({ data: users }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}