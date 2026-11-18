import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "EMAIL_EXISTS", message: "An account with this email already exists" } },
        { status: 400 }
      );
    }

    // Resolve Institution
    let institution = await prisma.institution.findFirst({
      where: { slug: { in: [parsed.institutionSlug || "newton", "newton", "apex"] } },
    });

    if (!institution) {
      institution = await prisma.institution.findFirst();
      if (!institution) {
        throw new Error("No institution configured in system");
      }
    }

    const user = await prisma.user.create({
      data: {
        institutionId: institution.id,
        name: parsed.name,
        email: parsed.email,
        passwordHash: await hashPassword(parsed.password),
        role: parsed.role || "STUDENT",
        studentOrStaffId: parsed.studentOrStaffId || null,
        phone: parsed.phone || null,
      },
    });

    await logAudit({
      institutionId: institution.id,
      actorId: user.id,
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: user.id,
      metadata: { role: user.role, email: user.email },
    });

    const redirectUrl =
      user.role === "STAFF"
        ? "/staff/dashboard"
        : user.role === "ADMIN" || user.role === "SUPER_ADMIN"
        ? "/admin/dashboard"
        : "/dashboard";

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          redirectUrl,
        },
      },
      { status: 201 }
    );

    await createSession(user.id, response);

    return response;
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: e.message || "Invalid request" } },
      { status: 400 }
    );
  }
}
