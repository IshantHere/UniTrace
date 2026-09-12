import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { MapPin, Building, ShieldCheck, ChevronLeft, Layers } from "lucide-react";

export default async function AdminLocationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    requireRole(user, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  } catch {
    redirect("/dashboard");
  }

  const locations = await prisma.location.findMany({
    include: {
      campus: true,
      _count: { select: { items: true, sightings: true } },
    },
    orderBy: [{ building: "asc" }, { name: "asc" }],
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link href="/admin/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
            <ChevronLeft className="h-3.5 w-3.5" /> Admin Console
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campus Locations &amp; Zones</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic coordinates and building hierarchy for spatial distance calculations.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Location Name</th>
                <th className="px-5 py-3">Building &amp; Floor</th>
                <th className="px-5 py-3">Security Hub?</th>
                <th className="px-5 py-3">Geo-Coordinates</th>
                <th className="px-5 py-3 text-right">Items / Sightings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{loc.name}</td>
                  <td className="px-5 py-3.5">
                    {loc.building} • Floor {loc.floor || "Ground"}
                  </td>
                  <td className="px-5 py-3.5">
                    {loc.isSecurityDesk ? (
                      <span className="badge bg-emerald-100 text-emerald-800 font-bold">
                        ✓ SECURE DEPOT
                      </span>
                    ) : (
                      <span className="text-slate-400">Standard</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                    {loc.latitude ? `${loc.latitude.toFixed(4)}, ${loc.longitude?.toFixed(4)}` : "None"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800">
                    {loc._count.items} items / {loc._count.sightings} sightings
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
