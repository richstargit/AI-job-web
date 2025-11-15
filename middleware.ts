import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PUBLIC = ["/login", "/register", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  // const { pathname } = req.nextUrl;
  // const token = req.cookies.get("access_token")?.value || null;

  // // ให้ static ข้ามไปเลย
  // if (
  //   pathname.startsWith("/_next") ||
  //   pathname.startsWith("/static") ||
  //   pathname.startsWith("/assets") ||
  //   pathname.startsWith("/images") ||
  //   pathname.startsWith("/api") ||  
  //   pathname === "/favicon.ico"
  // ) {
  //   return NextResponse.next();
  // }

  // if (PUBLIC.includes(pathname)) {
  //   if (token) {
  //     return NextResponse.redirect(new URL("/home", req.url));
  //   }
  //   return NextResponse.next();
  // }

  // // หน้า protected → ถ้าไม่มี token → redirect login
  // if (!token) {
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }

  // // มี token → ปล่อยผ่านทันที (ไม่ verify ที่ middleware)
  return NextResponse.next();
}

export const config = { matcher: ["/:path*"] };