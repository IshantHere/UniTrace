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
              [IMMUTABLE-LEDGER // AUDIT-TRAIL]
            </span>
            <span className="badge-verified text-[10px]">
              TAMPER-EVIDENT
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Compliance &amp; Operational Audit Trail
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Cryptographic, chronological record of all report registrations, challenge submissions, claim authorizations, and physical handovers.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0 border-[#DADAD6] bg-white rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#171717]">
            <thead className="bg-[#F7F7F5] border-b border-[#DADAD6] text-[10px] font-mono uppercase text-[#777777]">
              <tr>
                <th className="px-5 py-3 font-medium">TIMESTAMP</th>
                <th className="px-5 py-3 font-medium">ACTION EVENT</th>
                <th className="px-5 py-3 font-medium">ACTOR / CREDENTIAL</th>
                <th className="px-5 py-3 font-medium">ENTITY TARGET</th>
                <th className="px-5 py-3 font-medium">METADATA DELTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DADAD6]/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F7F5] transition">
                  <td className="px-5 py-3.5 whitespace-nowrap text-[#777777] font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded border border-[#DADAD6] bg-[#F7F7F5] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#171717]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[#171717]">{log.actor?.name || "Automated System"}</div>
                    <div className="font-mono text-[10px] text-[#777777]">{log.actor?.role || "SYSTEM"}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[#777777]">
                    {log.entityType} #{log.entityId.slice(-8)}
                  </td>
                  <td className="px-5 py-3.5 text-[#777777] max-w-sm truncate font-mono text-[10px]">
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
