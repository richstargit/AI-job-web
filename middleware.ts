import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const PUBLIC = ["/login", "/register", "/favicon.ico"];
  const token = req.cookies.get("access_token")?.value || null;

   if (
    pathname.startsWith("/_next") ||         // static chunks
    pathname.startsWith("/static") ||        // ถ้ามี
    pathname.startsWith("/assets") ||        // ถ้ามี
    pathname.startsWith("/images") ||        // ถ้ามี
    pathname === "/favicon.ico"              // กันเผื่อซ้ำ
  ) {
    return NextResponse.next();
  }

  if (PUBLIC.includes(pathname)) {
    if (token) {
      
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }



  return NextResponse.next();
}

export const config = { matcher: ["/:path*"] };
