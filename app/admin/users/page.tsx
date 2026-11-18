import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Users, Shield, User, ChevronLeft } from "lucide-react";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    requireRole(user, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  } catch {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { reportedItems: true, claims: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-6">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-xs font-mono text-[#777777] hover:text-[#171717] flex items-center gap-1 mb-2 transition"
          >
            <ChevronLeft className="h-3 w-3" />
            <span>RETURN TO ADMIN CONSOLE</span>
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [IDENTITY-SYSTEM // ROLES]
            </span>
            <span className="badge-neutral text-[10px]">
              CAMPUS DIRECTORY
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Campus User &amp; Credential Directory
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Role assignments, student IDs, and verification privileges across Newton University institution.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0 border-[#DADAD6] bg-white rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#171717]">
            <thead className="bg-[#F7F7F5] border-b border-[#DADAD6] text-[10px] font-mono uppercase text-[#777777]">
              <tr>
                <th className="px-5 py-3 font-medium">USER DESIGNATION</th>
                <th className="px-5 py-3 font-medium">UNIVERSITY EMAIL</th>
                <th className="px-5 py-3 font-medium">SYSTEM ROLE</th>
                <th className="px-5 py-3 font-medium">STUDENT / STAFF ID</th>
                <th className="px-5 py-3 font-medium text-right">ACTIVITY RECORD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DADAD6]/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F7F7F5] transition">
                  <td className="px-5 py-3.5 font-semibold text-[#171717]">{u.name}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[#777777]">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        u.role === "ADMIN"
                          ? "bg-[#171717] text-white border-[#171717]"
                          : u.role === "STAFF"
                          ? "bg-[#3867E8]/10 text-[#3867E8] border-[#3867E8]/30"
                          : "bg-[#F7F7F5] text-[#777777] border-[#DADAD6]"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[#777777]">
                    {u.studentOrStaffId || "None"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[11px] text-[#171717]">
                    {u._count.reportedItems} reports • {u._count.claims} claims
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
