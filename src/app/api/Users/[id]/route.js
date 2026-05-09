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
export async function DELETE(req, { params }) {
    const session = await requireAdmin();
    if (!session) return forbidden();
  
    
  await dbConnect();

  const { id } = await params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
export async function PUT(req, { params }) {
        const session = await requireAdmin();
    if (!session) return forbidden();
  await dbConnect();

  const { id } = await params;

  try {
    const body = await req.json();

    
    delete body.email;

    const user = await User.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).select("-password");

    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return Response.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}