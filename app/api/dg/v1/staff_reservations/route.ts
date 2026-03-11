import { NextRequest, NextResponse } from "next/server";
import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifyStaffRequest } from "@/lib/auth";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const publicToken = req.nextUrl.searchParams.get("token");
  const allowed = verifyStaffRequest(req) || (env.staffPublicToken && publicToken === env.staffPublicToken);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const status = req.nextUrl.searchParams.get("status") as ReservationStatus | null;
  const startDate = req.nextUrl.searchParams.get("startDate");
  const endDate = req.nextUrl.searchParams.get("endDate");
  const sort = req.nextUrl.searchParams.get("sort") ?? "createdAt";
  const order = req.nextUrl.searchParams.get("order") === "asc" ? "asc" : "desc";
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Math.min(100, Number(req.nextUrl.searchParams.get("pageSize") ?? "20"));

  const where: any = {
    ...(q
      ? {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(status ? { status } : {}),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {})
          }
        }
      : {})
  };

  const validSort = ["code", "name", "phone", "date", "time", "createdAt", "status", "pax"];
  const orderBy = validSort.includes(sort) ? { [sort]: order } : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.reservation.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.reservation.count({ where })
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}
