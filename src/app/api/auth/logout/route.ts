import { NextResponse } from "next/server";

export async function POST() {
  // TODO: implement logout logic (clear session/cookie)
  return NextResponse.json({ message: "Logout endpoint" }, { status: 200 });
}
