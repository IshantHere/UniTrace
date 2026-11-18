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
              [TAXONOMY-SYSTEM // CLASSIFICATION]
            </span>
            <span className="badge-neutral text-[10px]">
              PROPERTY PROTOCOLS
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Item Taxonomy &amp; Categories
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Configure high-value designations, automated matching weights, and verification schemas for campus property.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0 border-[#DADAD6] bg-white rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#171717]">
            <thead className="bg-[#F7F7F5] border-b border-[#DADAD6] text-[10px] font-mono uppercase text-[#777777]">
              <tr>
                <th className="px-5 py-3 font-medium">CATEGORY DESIGNATION</th>
                <th className="px-5 py-3 font-medium">SLUG IDENTIFIER</th>
                <th className="px-5 py-3 font-medium">SECURITY PROTOCOL</th>
                <th className="px-5 py-3 font-medium">VERIFICATION SCHEMA</th>
                <th className="px-5 py-3 font-medium text-right">TOTAL INVENTORY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DADAD6]/60">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#F7F7F5] transition">
                  <td className="px-5 py-3.5 font-semibold text-[#171717]">{cat.name}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[#777777]">{cat.slug}</td>
                  <td className="px-5 py-3.5">
                    {cat.isHighValue ? (
                      <span className="badge-signal text-[10px]">
                        ★ HIGH-VALUE PROTOCOL
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-[#777777]">STANDARD INTAKE</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[#777777] max-w-xs truncate font-mono text-[10px]">
                    {cat.verificationSchemaJson ? "Custom Questions Schema" : "Default Zero-Knowledge Challenge"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[11px] text-[#171717]">
                    {cat._count.items} items
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
