import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PUBLIC = ["/login", "/register", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value || null;

  // ให้ static ข้ามไปเลย
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ===== 1) หน้า public =====
  if (PUBLIC.includes(pathname)) {
    // ยังไม่มี token → ให้เข้า login/register ได้ปกติ
    if (!token) {
      return NextResponse.next();
    }

    // มี token แล้ว → เช็คกับ backend ว่าใช้ได้จริงไหม
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // ส่ง cookie token ตามไปให้ backend
          cookie: `access_token=${token}`,
        },
      });

      const user = await res.json();

      if (!res.ok || !user.isSuccess) {
        // token พัง → เคลียร์คุกกี้ แล้วให้ user อยู่หน้า login ต่อได้ (ไม่ต้อง redirect ซ้ำ)
        const resp = NextResponse.next();
        resp.cookies.set("access_token", "", { maxAge: 0 });
        return resp;
      }

      // token ใช้ได้ → ไม่ควรอยู่หน้า login แล้ว → เด้งไป /home
      const homeUrl = new URL("/home", req.url);
      return NextResponse.redirect(homeUrl);
    } catch (err) {
      // backend ล่มก็ให้เข้า login หน้าปกติไปก่อน
      return NextResponse.next();
    }
  }

  // ===== 2) หน้าอื่น (protected) =====

  // ไม่มี token เลย → บังคับไป login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // มี token → เช็คกับ backend
  try {
    const res = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: `access_token=${token}`,
      },
    });

    const user = await res.json();

    if (!res.ok || !user.isSuccess) {
      const loginUrl = new URL("/login", req.url);
      const resp = NextResponse.redirect(loginUrl);
      resp.cookies.set("access_token", "", { maxAge: 0 });
      return resp;
    }

    const isHR = user.user.isHR

    // 4) ตรวจสิทธิ์ตาม role + path

    // HR area: /hr...
    if (pathname.startsWith("/hr")) {
      // ถ้าไม่ใช่ HR ห้ามเข้า → ส่งไป home (candidate)
      if (!isHR) {
        const homeUrl = new URL("/home", req.url);
        return NextResponse.redirect(homeUrl);
      }
      return NextResponse.next();
    }

    // Candidate area: /home...
    if (pathname.startsWith("/home")) {
      // ถ้าเป็น HR → ไม่ให้ใช้หน้า candidate ส่งไป /hr
      if (isHR) {
        const hrUrl = new URL("/hr", req.url);
        return NextResponse.redirect(hrUrl);
      }
      return NextResponse.next();
    }
  } catch (err) {
    const loginUrl = new URL("/login", req.url);
    const resp = NextResponse.redirect(loginUrl);
    resp.cookies.set("access_token", "", { maxAge: 0 });
    return resp;
  }
}

export const config = { matcher: ["/:path*"] };