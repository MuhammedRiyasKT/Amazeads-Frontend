import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // TODO: implement login logic
  const body = await request.json();
  void body;
  return NextResponse.json({ message: "Login endpoint" }, { status: 200 });
}
