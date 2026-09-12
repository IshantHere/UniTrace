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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link href="/admin/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
            <ChevronLeft className="h-3.5 w-3.5" /> Admin Console
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campus User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role assignments, student IDs, and verification privileges across the institution.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">User Name</th>
                <th className="px-5 py-3">University Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Student / Staff ID</th>
                <th className="px-5 py-3 text-right">Reports / Claims</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`badge text-[10px] font-bold ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : u.role === "STAFF"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                    {u.studentOrStaffId || "None"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800">
                    {u._count.reportedItems} reports / {u._count.claims} claims
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
