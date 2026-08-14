import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value;

  const isDashboardPage =
    request.nextUrl.pathname.startsWith("/sales") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/manager") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/hr") ||
    request.nextUrl.pathname.startsWith("/designing") ||
    request.nextUrl.pathname.startsWith("/printing") ||
    request.nextUrl.pathname.startsWith("/production") ||
    request.nextUrl.pathname.startsWith("/logistics") ||
    request.nextUrl.pathname.startsWith("/accounts") ||
    request.nextUrl.pathname.startsWith("/marketing") ||
    request.nextUrl.pathname.startsWith("/project-manager") ||
    request.nextUrl.pathname.startsWith("/projects") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/reports") ||
    request.nextUrl.pathname.startsWith("/tasks");

  if (isDashboardPage && !isLoggedIn) {
    // Login ചെയ്തിട്ടില്ലെങ്കിൽ /login-ലേക്ക് redirect ചെയ്യുന്നു
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();

  // ─── Cache-Control: no-store ───────────────────────────────────────────────
  // Protected pages browser cache-ൽ store ആകാതിരിക്കാൻ.
  // ഇത് ഇല്ലെങ്കിൽ logout ചെയ്ത ശേഷം back button press ചെയ്‌ത്
  // browser cached authenticated page show ചെയ്‌തേക്കാം.
  if (isDashboardPage) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    // Static files, images, Next.js internals ഒഴിവാക്കുന്നു
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
