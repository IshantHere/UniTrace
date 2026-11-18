"use client";

import { useState } from "react";
import { Compass, Shield, Navigation, Layers, CheckCircle2, Sparkles, MapPin } from "lucide-react";

export interface MapPoint {
  id: string;
  sequence: number;
  name: string;
  locationName?: string;
  building: string;
  timestamp: string | Date;
  sightingType: "OBSERVED" | "AI_INFERRED";
  confidence: number;
  reportedBy: string;
  notes?: string | null;
  isCurrentLocation: boolean;
  x?: number;
  y?: number;
}

interface CampusMapProps {
  points: MapPoint[];
  activePointId?: string;
  onSelectPoint?: (point: MapPoint) => void;
}

export function CampusMap({ points, activePointId, onSelectPoint }: CampusMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(
    points.find((p) => p.isCurrentLocation) || points[0] || null
  );

  // Normalized campus building footprint anchors on 1000x600 canvas
  const buildingNodes: Record<string, { x: number; y: number; label: string; isSecurity?: boolean }> = {
    "Main Library": { x: 220, y: 380, label: "Main Library & Steps" },
    "Block 32": { x: 480, y: 310, label: "Block 32 Tech Courtyard" },
    "Administration Building": { x: 740, y: 220, label: "Central Security Hub", isSecurity: true },
    "Student Union": { x: 300, y: 180, label: "Student Union & Dining" },
    "Engineering Hall": { x: 780, y: 440, label: "Engineering Complex" },
  };

  const mappedPoints = points.map((p, idx) => {
    const node = buildingNodes[p.building] || {
      x: 300 + (idx * 120) % 400,
      y: 250 + (idx * 80) % 200,
      label: p.building,
    };
    const jitterX = (idx * 18) % 36 - 18;
    const jitterY = (idx * 14) % 28 - 14;
    return {
      ...p,
      x: node.x + jitterX,
      y: node.y + jitterY,
    };
  });

  const handlePointClick = (p: MapPoint) => {
    setSelectedPoint(p);
    if (onSelectPoint) onSelectPoint(p);
  };

  return (
    <div className="border border-[#DADAD6] bg-[#141413] text-white rounded-md overflow-hidden shadow-fine relative">
      {/* Control Room Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#2A2A28] bg-[#1B1B19] px-4 py-2.5 font-mono text-[11px]">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-[#25845A]" />
          <span className="font-bold tracking-wider text-white">SPATIAL CONTROL WORKSPACE</span>
          <span className="text-[#555555]">/</span>
          <span className="text-[#999999]">GRID: 1000m × 600m</span>
        </div>

        <div className="flex items-center gap-5 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#25845A]" />
            <span className="font-semibold text-white">OBSERVED CHECKPOINT</span>
            <span className="text-[#777777]">(SOLID LINE)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#3867E8]" />
            <span className="font-semibold text-white">AI-INFERRED TRANSIT</span>
            <span className="text-[#777777]">(DASHED LINE)</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#999999]">
            <Shield className="h-3 w-3 text-[#3867E8]" />
            DEPOT STATION
          </span>
        </div>
      </div>

      {/* SVG Architectural Topography Grid */}
      <div className="relative aspect-[16/9] w-full bg-[#141413]">
        <svg viewBox="0 0 1000 600" className="h-full w-full select-none">
          <defs>
            {/* Grid Pattern */}
            <pattern id="telemetryGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#222220" strokeWidth="0.8" />
            </pattern>
          </defs>

          <rect width="1000" height="600" fill="url(#telemetryGrid)" />

          {/* Architectural Campus Building Footprints */}
          <g className="opacity-90">
            {/* Main Library */}
            <rect x="150" y="320" width="160" height="140" fill="#1C1C1A" stroke="#333330" strokeWidth="1.5" />
            <text x="230" y="390" fill="#888885" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              MAIN LIBRARY
            </text>
            <text x="230" y="405" fill="#555552" fontSize="9" fontFamily="monospace" textAnchor="middle">
              ZONE A-102
            </text>

            {/* Block 32 Tech Courtyard */}
            <rect x="420" y="250" width="140" height="130" fill="#1C1C1A" stroke="#333330" strokeWidth="1.5" />
            <text x="490" y="315" fill="#888885" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              BLOCK 32 COURTYARD
            </text>
            <text x="490" y="330" fill="#555552" fontSize="9" fontFamily="monospace" textAnchor="middle">
              ZONE B-204
            </text>

            {/* Central Security Depot & Lockers */}
            <rect x="670" y="160" width="160" height="130" fill="#182238" stroke="#3867E8" strokeWidth="1.5" />
            <text x="750" y="220" fill="#78A0F8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              SECURITY DEPOT
            </text>
            <text x="750" y="235" fill="#5575B5" fontSize="9" fontFamily="monospace" textAnchor="middle">
              CENTRAL LOCKERS #04
            </text>

            {/* Student Union */}
            <rect x="230" y="130" width="150" height="110" fill="#1C1C1A" stroke="#333330" strokeWidth="1.5" />
            <text x="305" y="185" fill="#888885" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              STUDENT UNION
            </text>
            <text x="305" y="200" fill="#555552" fontSize="9" fontFamily="monospace" textAnchor="middle">
              DINING HALL
            </text>

            {/* Engineering Hall */}
            <rect x="710" y="380" width="160" height="130" fill="#1C1C1A" stroke="#333330" strokeWidth="1.5" />
            <text x="790" y="445" fill="#888885" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              ENGINEERING LABS
            </text>
            <text x="790" y="460" fill="#555552" fontSize="9" fontFamily="monospace" textAnchor="middle">
              ROBOTICS WING
            </text>

            {/* Campus Primary Walkway Corridors */}
            <path d="M 230 380 L 490 310" stroke="#2A2A28" strokeWidth="2" strokeDasharray="2 4" />
            <path d="M 490 310 L 750 220" stroke="#2A2A28" strokeWidth="2" strokeDasharray="2 4" />
            <path d="M 305 185 L 490 310" stroke="#2A2A28" strokeWidth="2" strokeDasharray="2 4" />
            <path d="M 790 445 L 750 220" stroke="#2A2A28" strokeWidth="2" strokeDasharray="2 4" />
          </g>

          {/* Differentiated Sighting Trajectory Segments */}
          {mappedPoints.map((p, idx) => {
            if (idx === 0) return null;
            const prev = mappedPoints[idx - 1];
            const isInferred = p.sightingType === "AI_INFERRED";

            return (
              <g key={`traj-${p.id}`}>
                <line
                  x1={prev.x}
                  y1={prev.y}
                  x2={p.x}
                  y2={p.y}
                  stroke={isInferred ? "#3867E8" : "#25845A"}
                  strokeWidth={isInferred ? "2.5" : "3.5"}
                  strokeDasharray={isInferred ? "6 4" : undefined}
                />
                {/* Midpoint vector label */}
                <g transform={`translate(${(prev.x + p.x) / 2}, ${(prev.y + p.y) / 2})`}>
                  <rect x="-30" y="-8" width="60" height="16" fill="#141413" stroke={isInferred ? "#3867E8" : "#25845A"} strokeWidth="1" rx="2" />
                  <text textAnchor="middle" y="3" fill={isInferred ? "#96B8F8" : "#A2E2BF"} fontSize="8" fontFamily="monospace">
                    {isInferred ? "INFERRED" : "OBSERVED"}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Radar Node Pins */}
          {mappedPoints.map((p) => {
            const isObserved = p.sightingType === "OBSERVED";
            const isSelected = selectedPoint?.id === p.id;

            return (
              <g
                key={p.id}
                transform={`translate(${p.x}, ${p.y})`}
                onClick={() => handlePointClick(p)}
                className="cursor-pointer group"
              >
                {/* Active Selection Ring */}
                {isSelected && (
                  <circle r="18" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" />
                )}

                {/* Pin Core */}
                <circle
                  r={isSelected ? "12" : "9"}
                  fill={isObserved ? "#25845A" : "#3867E8"}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* Sequence Step Identifier */}
                <text
                  textAnchor="middle"
                  dy="3.5"
                  fill="#FFFFFF"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {p.sequence}
                </text>

                {/* Sighting Metadata Tag */}
                <g transform="translate(0, -18)">
                  <rect
                    x="-40"
                    y="-10"
                    width="80"
                    height="16"
                    rx="2"
                    fill="#1C1C1A"
                    stroke={isObserved ? "#25845A" : "#3867E8"}
                    strokeWidth="1"
                  />
                  <text textAnchor="middle" y="2" fill="#FFFFFF" fontSize="8" fontFamily="monospace">
                    {p.building.slice(0, 12)}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Selected Checkpoint Floating Telemetry Inspector */}
        {selectedPoint && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md border border-[#333330] bg-[#1C1C1A] p-4 rounded-md shadow-popover space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#2A2A28] pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#171717] border border-[#444440] text-[10px] font-bold text-white">
                  #{selectedPoint.sequence}
                </span>
                <span className="font-bold text-white text-xs">{selectedPoint.name || selectedPoint.locationName}</span>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${
                  selectedPoint.sightingType === "OBSERVED"
                    ? "bg-[#25845A]/20 text-[#A2E2BF] border border-[#25845A]"
                    : "bg-[#3867E8]/20 text-[#96B8F8] border border-[#3867E8]"
                }`}
              >
                {selectedPoint.sightingType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#999999]">
              <div>
                <span className="text-[#666666] block text-[9px]">SIGHTING TIME</span>
                <span className="text-white">{new Date(selectedPoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div>
                <span className="text-[#666666] block text-[9px]">REPORTING SOURCE</span>
                <span className="text-white truncate block">{selectedPoint.reportedBy}</span>
              </div>
            </div>

            {selectedPoint.notes && (
              <div className="border-t border-[#2A2A28] pt-2 text-[10px] text-[#BBBBBB] leading-relaxed">
                &quot;{selectedPoint.notes}&quot;
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}