import { NextResponse } from "next/server";

export async function GET() {
  // TODO: verify session/token and return current user
  return NextResponse.json({ message: "Me endpoint" }, { status: 200 });
}
