import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, FileText, ChevronLeft, Clock } from "lucide-react";

export default async function AdminAuditLogsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    requireRole(user, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  } catch {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      actor: { select: { name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link href="/admin/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
            <ChevronLeft className="h-3.5 w-3.5" /> Admin Console
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Compliance &amp; Operational Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all report creation, claim approvals, item handovers, and merges.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Actor / Performer</th>
                <th className="px-5 py-3">Entity Target</th>
                <th className="px-5 py-3">Metadata Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{log.actor?.name || "Automated System"}</div>
                    <div className="text-[10px] text-slate-400">{log.actor?.role || "SYSTEM"}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                    {log.entityType} #{log.entityId.slice(-8)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-sm truncate font-mono text-[10px]">
                    {log.metadata || "{}"}
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
