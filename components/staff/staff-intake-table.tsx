"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getClientItems, mergeItems } from "@/lib/client-storage";

interface StaffIntakeTableProps {
  initialItems: any[];
}

export function StaffIntakeTable({ initialItems }: StaffIntakeTableProps) {
  const [items, setItems] = useState<any[]>(initialItems || []);

  useEffect(() => {
    const refreshItems = () => {
      const clientItems = getClientItems();
      setItems(mergeItems(initialItems, clientItems));
    };

    refreshItems();

    const handleItemSaved = () => refreshItems();
    window.addEventListener("unitrace_item_saved", handleItemSaved);
    window.addEventListener("focus", refreshItems);

    return () => {
      window.removeEventListener("unitrace_item_saved", handleItemSaved);
      window.removeEventListener("focus", refreshItems);
    };
  }, [initialItems]);

  return (
    <section className="card p-6 sm:p-7 space-y-5 border-[#DADAD6] bg-white rounded">
      <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
            [INTAKE-FEED // LIVE-STREAM]
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-[#171717] mt-0.5">
            Recent Campus Intake Submissions ({items.length})
          </h2>
        </div>
        <Link
          href="/search"
          className="text-xs font-mono font-medium text-[#171717] hover:text-[#3867E8] transition flex items-center gap-1"
        >
          <span>View Full Catalog</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#171717]">
          <thead>
            <tr className="border-b border-[#DADAD6] text-[10px] font-mono uppercase text-[#777777]">
              <th className="pb-2.5 font-medium">TYPE</th>
              <th className="pb-2.5 font-medium">ITEM DESIGNATION</th>
              <th className="pb-2.5 font-medium">FACILITY / LOCATION</th>
              <th className="pb-2.5 font-medium">REPORTER</th>
              <th className="pb-2.5 font-medium">DATE</th>
              <th className="pb-2.5 font-medium text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DADAD6]/60">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-[#F7F7F5] transition">
                <td className="py-3">
                  <span
                    className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      item.type === "LOST"
                        ? "bg-[#DC2626]/5 text-[#DC2626] border-[#DC2626]/20"
                        : "bg-[#25845A]/5 text-[#25845A] border-[#25845A]/20"
                    }`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="py-3 font-medium max-w-xs truncate pr-4">
                  {item.title}
                </td>
                <td className="py-3 text-[#777777]">
                  {item.primaryLocation?.name || "Campus Grounds"}
                </td>
                <td className="py-3 text-[#777777]">
                  {item.reporter?.name || "Campus User"}
                </td>
                <td className="py-3 font-mono text-[11px] text-[#777777]">
                  {new Date(item.incidentDate || item.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/journey/${item.id}`}
                    className="border border-[#DADAD6] bg-white px-2.5 py-1 text-[11px] font-mono font-medium text-[#171717] hover:border-[#171717] transition rounded"
                  >
                    Timeline
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
