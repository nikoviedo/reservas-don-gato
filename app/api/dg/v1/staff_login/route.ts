import { NextRequest, NextResponse } from "next/server";
import { createStaffToken, getStaffCookieName } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.password !== env.staffPassword) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = createStaffToken();
  const response = NextResponse.json({ ok: true, token });
  response.cookies.set(getStaffCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production"
  });
  return response;
}
