import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { env } from "@/lib/env";

const COOKIE_NAME = "dg_staff";

export function createStaffToken() {
  return jwt.sign({ role: "staff" }, env.jwtSecret, { expiresIn: "12h" });
}

export function verifyStaffRequest(req: NextRequest) {
  const bearer = req.headers.get("authorization")?.replace("Bearer ", "");
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const token = bearer ?? cookie;
  if (!token) return false;
  try {
    jwt.verify(token, env.jwtSecret);
    return true;
  } catch {
    return false;
  }
}

export function getStaffCookieName() {
  return COOKIE_NAME;
}
