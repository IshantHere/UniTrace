import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      success: true,
      data: {
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              points: user.points,
              credits: user.credits,
              tier: user.tier,
              studentOrStaffId: user.studentOrStaffId,
              institution: user.institution
                ? {
                    id: user.institution.id,
                    name: user.institution.name,
                    slug: user.institution.slug,
                  }
                : null,
            }
          : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch session" } },
      { status: 500 }
    );
  }
}
