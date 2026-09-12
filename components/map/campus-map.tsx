"use client";

import { useState } from "react";
import { MapPin, Compass, Shield, Sparkles, Navigation, Layers } from "lucide-react";

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
  x?: number; // Normalized % 0-100
  y?: number; // Normalized % 0-100
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

  // Campus building coordinate layout on our normalized 1000x600 canvas
  const buildingNodes: Record<string, { x: number; y: number; label: string; isSecurity?: boolean }> = {
    "Main Library": { x: 220, y: 380, label: "Main Library & Steps" },
    "Block 32": { x: 480, y: 310, label: "Block 32 Tech Courtyard" },
    "Administration Building": { x: 740, y: 220, label: "Central Security Hub", isSecurity: true },
    "Student Union": { x: 300, y: 180, label: "Student Union & Dining" },
    "Engineering Hall": { x: 780, y: 440, label: "Engineering Complex" },
  };

  // Assign coordinates to points based on their building name
  const mappedPoints = points.map((p, idx) => {
    const node = buildingNodes[p.building] || {
      x: 300 + (idx * 120) % 400,
      y: 250 + (idx * 80) % 200,
      label: p.building,
    };
    // Add jitter if multiple sightings in same building
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
    <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white overflow-hidden shadow-xl relative">
      {/* Map Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-brand-400 animate-spin" />
          <span className="font-bold text-slate-200">Apex University Main Campus Grid</span>
          <span className="rounded bg-brand-900/80 text-brand-300 px-2 py-0.5 font-mono text-[10px] border border-brand-700/50">
            SPATIAL RADAR ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
            <strong className="text-slate-200">OBSERVED</strong> Checkpoint
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500 ring-2 ring-purple-500/30" />
            <strong className="text-slate-200">AI-INFERRED</strong> Corridor
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-indigo-400" />
            Security Hub
          </span>
        </div>
      </div>

      {/* SVG Interactive Campus Topography */}
      <div className="relative aspect-[16/9] w-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
        <svg viewBox="0 0 1000 600" className="h-full w-full select-none">
          {/* Static Campus Building Footprints */}
          <g className="opacity-70">
            {/* Main Library */}
            <rect x="150" y="320" width="160" height="140" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <text x="230" y="395" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">
              MAIN LIBRARY
            </text>

            {/* Block 32 */}
            <rect x="420" y="250" width="140" height="130" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <text x="490" y="320" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">
              BLOCK 32
            </text>

            {/* Administration / Security Hub */}
            <rect x="670" y="160" width="160" height="130" rx="12" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
            <text x="750" y="225" fill="#60a5fa" fontSize="12" fontWeight="bold" textAnchor="middle">
              ADMIN / SECURITY
            </text>
            <text x="750" y="245" fill="#3b82f6" fontSize="10" textAnchor="middle">
              Depot Locker Station
            </text>

            {/* Student Union */}
            <rect x="230" y="130" width="150" height="110" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <text x="305" y="190" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">
              STUDENT UNION
            </text>

            {/* Engineering Complex */}
            <rect x="710" y="380" width="160" height="130" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <text x="790" y="450" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">
              ENGINEERING LABS
            </text>

            {/* Campus Pathways */}
            <path d="M 230 380 L 490 310" stroke="#334155" strokeWidth="3" strokeDasharray="3 3" />
            <path d="M 490 310 L 750 220" stroke="#334155" strokeWidth="3" strokeDasharray="3 3" />
            <path d="M 305 190 L 490 310" stroke="#334155" strokeWidth="3" strokeDasharray="3 3" />
            <path d="M 790 440 L 750 220" stroke="#334155" strokeWidth="3" strokeDasharray="3 3" />
          </g>

          {/* Probable Movement Trajectory Lines */}
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
                  stroke={isInferred ? "#a855f7" : "#10b981"}
                  strokeWidth={isInferred ? "3" : "4"}
                  strokeDasharray={isInferred ? "6 6" : undefined}
                  className="transition-all duration-300"
                />
                {/* Midpoint arrow indicator */}
                <circle
                  cx={(prev.x + p.x) / 2}
                  cy={(prev.y + p.y) / 2}
                  r="4"
                  fill={isInferred ? "#c084fc" : "#34d399"}
                />
              </g>
            );
          })}

          {/* Last Known / Probable Area Pulsating Radar Circle */}
          {mappedPoints.length > 0 && (
            <g
              transform={`translate(${mappedPoints[mappedPoints.length - 1].x}, ${
                mappedPoints[mappedPoints.length - 1].y
              })`}
            >
              <circle r="40" fill="#3b82f6" fillOpacity="0.15" className="animate-ping" />
              <circle r="25" fill="#3b82f6" fillOpacity="0.25" />
            </g>
          )}

          {/* Waypoint Markers */}
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
                {/* Glow ring on selected */}
                {isSelected && (
                  <circle r="20" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3 3" />
                )}

                {/* Marker body */}
                <circle
                  r={isSelected ? "14" : "11"}
                  fill={isObserved ? "#059669" : "#7e22ce"}
                  stroke={isSelected ? "#ffffff" : isObserved ? "#34d399" : "#c084fc"}
                  strokeWidth="2.5"
                  className="transition-all duration-200 group-hover:scale-125"
                />

                {/* Step Sequence Number */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {p.sequence}
                </text>

                {/* Quick building badge above pin */}
                <g transform="translate(0, -20)" opacity={isSelected ? "1" : "0.75"}>
                  <rect
                    x="-45"
                    y="-12"
                    width="90"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke={isObserved ? "#059669" : "#7e22ce"}
                    strokeWidth="1"
                  />
                  <text textAnchor="middle" y="0" fill="#e2e8f0" fontSize="9" fontWeight="600">
                    {p.building.slice(0, 14)}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Selected Point Overlay Card */}
        {selectedPoint && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md rounded-xl border border-slate-700/80 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  #{selectedPoint.sequence}
                </span>
                <span className="font-bold text-sm text-white">{selectedPoint.name || selectedPoint.locationName}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedPoint.sightingType === "OBSERVED"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                }`}
              >
                {selectedPoint.sightingType === "OBSERVED" ? "OBSERVED EVENT" : "AI-INFERRED TRANSIT"}
              </span>
            </div>

            <div className="text-xs text-slate-300">
              {selectedPoint.notes || "Recorded checkpoint along campus trajectory."}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Source: {selectedPoint.reportedBy}</span>
              <span>Confidence: {Math.round(selectedPoint.confidence * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
