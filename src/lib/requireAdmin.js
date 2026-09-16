import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export function forbidden() {
  return Response.json(
    { message: "Forbidden: Admins only" },
    { status: 403 }
  );
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") return null;
  return session;
}
