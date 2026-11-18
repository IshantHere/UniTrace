import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.parse(body);

    const inputRaw = (parsed.email || "").trim();
    const inputLower = inputRaw.toLowerCase();

    // Mapping known aliases, names, and personas directly to primary seed accounts
    const aliasMap: Record<string, string> = {
      // Student: Ishant Singh
      "student": "student@newton.edu",
      "student@newton.edu": "student@newton.edu",
      "student@apex.edu": "student@newton.edu",
      "ishant": "student@newton.edu",
      "ishant singh": "student@newton.edu",
      "ishantsingh": "student@newton.edu",
      "ishant@newton.edu": "student@newton.edu",
      "ishant.singh@newton.edu": "student@newton.edu",
      "alex": "student@newton.edu",
      "alex sharma": "student@newton.edu",
      "alex@apex.edu": "student@newton.edu",
      "alex@newton.edu": "student@newton.edu",
      "stu-2024-8841": "student@newton.edu",

      // Finder: Garvit Chahal
      "finder": "finder@newton.edu",
      "finder@newton.edu": "finder@newton.edu",
      "finder@apex.edu": "finder@newton.edu",
      "garvit": "finder@newton.edu",
      "garvit chahal": "finder@newton.edu",
      "garvitchahal": "finder@newton.edu",
      "garvit@newton.edu": "finder@newton.edu",
      "garvit.chahal@newton.edu": "finder@newton.edu",
      "maya": "finder@newton.edu",
      "maya lin": "finder@newton.edu",
      "maya@apex.edu": "finder@newton.edu",
      "maya@newton.edu": "finder@newton.edu",
      "stu-2024-9102": "finder@newton.edu",

      // Staff / Officer: Vijay Kumar
      "staff": "staff@newton.edu",
      "staff@newton.edu": "staff@newton.edu",
      "staff@apex.edu": "staff@newton.edu",
      "officer": "staff@newton.edu",
      "officer vance": "staff@newton.edu",
      "vijay": "staff@newton.edu",
      "vijay kumar": "staff@newton.edu",
      "vijaykumar": "staff@newton.edu",
      "vijay@newton.edu": "staff@newton.edu",
      "vijay.kumar@newton.edu": "staff@newton.edu",
      "vance": "staff@newton.edu",
      "vance@apex.edu": "staff@newton.edu",
      "vance@newton.edu": "staff@newton.edu",
      "sec-officer-44": "staff@newton.edu",

      // Admin: Anil Sharma
      "admin": "admin@newton.edu",
      "admin@newton.edu": "admin@newton.edu",
      "admin@apex.edu": "admin@newton.edu",
      "dean": "admin@newton.edu",
      "dean jenkins": "admin@newton.edu",
      "anil": "admin@newton.edu",
      "anil sharma": "admin@newton.edu",
      "anilsharma": "admin@newton.edu",
      "anil@newton.edu": "admin@newton.edu",
      "anil.sharma@newton.edu": "admin@newton.edu",
      "jenkins": "admin@newton.edu",
      "jenkins@apex.edu": "admin@newton.edu",
      "jenkins@newton.edu": "admin@newton.edu",
      "adm-dean-01": "admin@newton.edu",

      // Super Admin
      "superadmin": "superadmin@unitrace.io",
      "superadmin@unitrace.io": "superadmin@unitrace.io",
    };

    const targetEmail = aliasMap[inputLower] || inputLower;

    // Search user by email, swapped domain, student/staff ID, or exact name
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: targetEmail },
          { email: inputRaw },
          { email: inputLower },
          { email: targetEmail.includes("@apex.edu") ? targetEmail.replace("@apex.edu", "@newton.edu") : targetEmail },
          { email: targetEmail.includes("@newton.edu") ? targetEmail.replace("@newton.edu", "@apex.edu") : targetEmail },
          { studentOrStaffId: inputRaw },
          { name: inputRaw },
        ],
      },
      include: { institution: true },
    });

    // Fallback: search by partial match if not found
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { contains: inputLower } },
            { name: { contains: inputRaw } },
          ],
        },
        include: { institution: true },
      });
    }

    if (!user || !user.isActive || !(await verifyPassword(parsed.password, user.passwordHash))) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    // Ensure institution is populated if missing
    const institution: any = user.institution || (await prisma.institution.findFirst());

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const redirectUrl =
      user.role === "STAFF"
        ? "/staff/dashboard"
        : user.role === "ADMIN" || user.role === "SUPER_ADMIN"
        ? "/admin/dashboard"
        : "/dashboard";

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentOrStaffId: user.studentOrStaffId,
          institution: institution
            ? {
                id: institution.id,
                name: institution.name,
                slug: institution.slug,
              }
            : null,
        },
        redirectUrl,
      },
    });

    await createSession(user.id, response, user);

    return response;
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: e.message || "Invalid request" } },
      { status: 400 }
    );
  }
}
