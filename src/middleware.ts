import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // ടോക്കൺ ഉണ്ടോ എന്ന് നോക്കുന്നു (നിങ്ങളുടെ കയ്യിൽ റിയൽ API ഉണ്ടെങ്കിൽ കുക്കീസ് വഴിയോ മറ്റോ വെരിഫൈ ചെയ്യാം)
  // നിലവിൽ പ്രാഥമിക വെരിഫിക്കേഷനായി ഒരു സിമ്പിൾ റെഫറൻസ്:
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value;

  const isDashboardPage = request.nextUrl.pathname.startsWith("/sales") || 
                          request.nextUrl.pathname.startsWith("/admin") ||
                          request.nextUrl.pathname.startsWith("/manager");

  if (isDashboardPage && !isLoggedIn) {
    // ലോഗിൻ ചെയ്തിട്ടില്ലെങ്കിൽ തിരികെ ലോഗിൻ പേജിലേക്ക് തിരിച്ചുവിടുന്നു
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
