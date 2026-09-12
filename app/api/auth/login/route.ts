import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      include: { institution: true },
    });

    if (!user || !user.isActive || !(await verifyPassword(parsed.password, user.passwordHash))) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentOrStaffId: user.studentOrStaffId,
          institution: {
            id: user.institution.id,
            name: user.institution.name,
            slug: user.institution.slug,
          },
        },
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: e.message || "Invalid request" } },
      { status: 400 }
    );
  }
}
