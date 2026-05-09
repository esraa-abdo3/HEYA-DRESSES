import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  // لو داخل داشبورد
  if (isDashboard) {
    // مفيش login
    if (!token) {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    // مش admin
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next();
}

// يطبق على الداشبورد بس
export const config = {
  matcher: ["/Dashboard/:path*"],
};