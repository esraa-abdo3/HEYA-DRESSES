import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 🔥 مهم جدًا: استثناء Stripe webhook
  if (pathname.startsWith("/api/stripe/webhook")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isDashboard = pathname.startsWith("/Dashboard");

  if (isDashboard) {
    if (!token) {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next();
}