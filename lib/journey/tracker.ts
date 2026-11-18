import { prisma } from "../prisma";
import { SightingType } from "../constants";

export interface JourneyEvent {
  id: string;
  sequence: number;
  timestamp: Date;
  locationName: string;
  building: string;
  latitude: number | null;
  longitude: number | null;
  sightingType: SightingType;
  confidence: number;
  reportedBy: string;
  notes?: string | null;
  isCurrentLocation: boolean;
}

export async function getItemJourneyTimeline(itemId: string): Promise<{
  itemId: string;
  itemTitle: string;
  itemType: string;
  status: string;
  lastKnownLocation?: string;
  events: JourneyEvent[];
}> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      primaryLocation: true,
      sightings: {
        include: { location: true },
        orderBy: [{ sequenceOrder: "asc" }, { timestamp: "asc" }],
      },
    },
  });

  if (!item) {
    throw new Error("Item not found");
  }

  let sightings = item.sightings;

  // If item has no sightings yet, create a baseline observed sighting from primaryLocation
  if (sightings.length === 0) {
    const defaultSighting = await prisma.sighting.create({
      data: {
        itemId: item.id,
        locationId: item.primaryLocationId,
        timestamp: item.incidentDate,
        sightingType: "OBSERVED",
        confidence: 1.0,
        reportedBy: item.type === "LOST" ? "Reported by Owner" : "Turned in by Finder",
        notes: `Initial ${item.type.toLowerCase()} report logged at ${item.primaryLocation.name}.`,
        sequenceOrder: 1,
      },
      include: { location: true },
    });
    sightings = [defaultSighting];
  }

  const total = sightings.length;
  const events: JourneyEvent[] = sightings.map((s, idx) => ({
    id: s.id,
    sequence: s.sequenceOrder || idx + 1,
    timestamp: s.timestamp,
    locationName: s.location.name,
    building: s.location.building,
    latitude: s.location.latitude,
    longitude: s.location.longitude,
    sightingType: s.sightingType as SightingType,
    confidence: s.confidence,
    reportedBy: s.reportedBy || (s.sightingType === "OBSERVED" ? "Verified Witness" : "UniTrace Trajectory Engine"),
    notes: s.notes,
    isCurrentLocation: idx === total - 1,
  }));

  const lastEvent = events[events.length - 1];

  return {
    itemId: item.id,
    itemTitle: item.title,
    itemType: item.type,
    status: item.status,
    lastKnownLocation: lastEvent ? `${lastEvent.building} — ${lastEvent.locationName}` : undefined,
    events,
  };
}
