import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Tag, ShieldCheck, ChevronLeft } from "lucide-react";

export default async function AdminCategoriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    requireRole(user, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  } catch {
    redirect("/dashboard");
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link href="/admin/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
            <ChevronLeft className="h-3.5 w-3.5" /> Admin Console
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Item Taxonomy &amp; Categories</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure high-value designations and verification schemas for campus property.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Category Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">High-Value Policy</th>
                <th className="px-5 py-3">Verification Schema</th>
                <th className="px-5 py-3 text-right">Items Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{cat.name}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">{cat.slug}</td>
                  <td className="px-5 py-3.5">
                    {cat.isHighValue ? (
                      <span className="badge bg-amber-100 text-amber-800 font-bold">
                        ★ STRICT VERIFICATION
                      </span>
                    ) : (
                      <span className="text-slate-400">Standard Intake</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                    {cat.verificationSchemaJson ? "Custom Questions Configured" : "Default Template"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800">
                    {cat._count.items}
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
