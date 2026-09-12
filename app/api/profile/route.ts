import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional(),
  studentOrStaffId: z.string().trim().max(32).optional(),
});

const safe = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  studentOrStaffId: user.studentOrStaffId,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  points: user.points ?? 0,
  credits: user.credits ?? 0,
  tier: user.tier ?? "BRONZE",
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  return NextResponse.json({ success: true, data: { user: safe(user) } });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });

  const parsed = profileSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Please provide valid profile details" } }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  return NextResponse.json({ success: true, data: { user: safe(updated) } });
}
