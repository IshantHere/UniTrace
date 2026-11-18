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
              [GEOSPATIAL-REGISTRY // ZONES]
            </span>
            <span className="badge-neutral text-[10px]">
              CAMPUS MAPPING
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Campus Locations &amp; Zones
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Geographic coordinates and building hierarchy for spatial correlation and physical custody tracking.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden p-0 border-[#DADAD6] bg-white rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#171717]">
            <thead className="bg-[#F7F7F5] border-b border-[#DADAD6] text-[10px] font-mono uppercase text-[#777777]">
              <tr>
                <th className="px-5 py-3 font-medium">LOCATION DESIGNATION</th>
                <th className="px-5 py-3 font-medium">BUILDING &amp; FLOOR</th>
                <th className="px-5 py-3 font-medium">SECURITY FACILITY</th>
                <th className="px-5 py-3 font-medium">GEOSPATIAL COORDINATES</th>
                <th className="px-5 py-3 font-medium text-right">ACTIVITY VOLUME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DADAD6]/60">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-[#F7F7F5] transition">
                  <td className="px-5 py-3.5 font-semibold text-[#171717]">{loc.name}</td>
                  <td className="px-5 py-3.5 text-[#777777]">
                    {loc.building} • Floor {loc.floor || "Ground"}
                  </td>
                  <td className="px-5 py-3.5">
                    {loc.isSecurityDesk ? (
                      <span className="badge-verified text-[10px]">
                        ✓ SECURE DEPOT
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-[#777777]">STANDARD ZONE</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[#777777]">
                    {loc.latitude ? `${loc.latitude.toFixed(4)}, ${loc.longitude?.toFixed(4)}` : "None"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[11px] text-[#171717]">
                    {loc._count.items} items • {loc._count.sightings} sightings
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
