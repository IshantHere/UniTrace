import { describe, expect, it } from "vitest";
import { prisma } from "../../lib/prisma";
import { sendItemReportNotification } from "../../lib/notifications/item-alert";
import { runAutomaticMatching } from "../../lib/matching/engine";

describe("User Reported Items Flow & Realtime Search/Staff Registry", () => {
  let createdItemId: string;

  it("1. Reports a new found item and persists with status ACTIVE", async () => {
    const finder = await prisma.user.findFirst({
      where: { email: "finder@newton.edu" },
    });
    expect(finder).toBeDefined();

    const category = await prisma.category.findFirst({
      where: { slug: { contains: "audio" } },
    });
    expect(category).toBeDefined();

    const location = await prisma.location.findFirst({
      where: { building: { contains: "Library" } },
    });
    expect(location).toBeDefined();

    const item = await prisma.item.create({
      data: {
        institutionId: finder!.institutionId,
        reporterId: finder!.id,
        type: "FOUND",
        title: "Beats Studio Pro Headphones in Black Case",
        description: "Found black wireless over-ear headphones on 2nd floor library study desk near window.",
        categoryId: category!.id,
        primaryLocationId: location!.id,
        incidentDate: new Date(),
        incidentTime: "14:30",
        status: "ACTIVE",
        isHighValue: true,
        privateNotes: "Custody: SECURED_AT_DESK. Notes: small white initials TS on headband",
      },
      include: {
        category: true,
        primaryLocation: true,
      },
    });

    createdItemId = item.id;
    expect(item.id).toBeDefined();
    expect(item.status).toBe("ACTIVE");
    expect(item.type).toBe("FOUND");
  });

  it("2. Dispatches notifications (in-app and Telegram) without error", async () => {
    const item = await prisma.item.findUnique({
      where: { id: createdItemId },
      include: { category: true, primaryLocation: true, reporter: true },
    });
    expect(item).not.toBeNull();

    const result = await sendItemReportNotification({
      itemId: item!.id,
      type: "FOUND",
      title: item!.title,
      description: item!.description,
      categoryName: item!.category?.name,
      locationName: item!.primaryLocation.name,
      buildingName: item!.primaryLocation.building,
      reporterId: item!.reporterId,
      reporterName: item!.reporter.name,
      reporterRole: item!.reporter.role,
      isHighValue: item!.isHighValue,
    });

    expect(result).toBeDefined();

    // Verify in-app notifications were created
    const notifications = await prisma.notification.findMany({
      where: {
        title: { contains: "Beats Studio Pro" },
      },
    });
    expect(notifications.length).toBeGreaterThanOrEqual(1);
  });

  it("3. New item is immediately discoverable via search criteria", async () => {
    // Exact word search
    const resultsBeats = await prisma.item.findMany({
      where: {
        OR: [
          { title: { contains: "Beats" } },
          { description: { contains: "Beats" } },
        ],
      },
    });
    expect(resultsBeats.some((i) => i.id === createdItemId)).toBe(true);

    // Multi-token search (e.g. "headphones library")
    const words = ["headphones", "library"];
    const resultsMulti = await prisma.item.findMany({
      where: {
        OR: words.flatMap((w) => [
          { title: { contains: w } },
          { description: { contains: w } },
          { primaryLocation: { name: { contains: w } } },
          { primaryLocation: { building: { contains: w } } },
        ]),
      },
    });
    expect(resultsMulti.some((i) => i.id === createdItemId)).toBe(true);
  });

  it("4. New item appears in Staff Portal intake list", async () => {
    const staffRecentItems = await prisma.item.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        primaryLocation: true,
        reporter: { select: { name: true, role: true } },
      },
    });

    // The most recently created item should be right at the top
    const found = staffRecentItems.find((i) => i.id === createdItemId);
    expect(found).toBeDefined();
    expect(found?.title).toContain("Beats Studio Pro");
  });

  it("5. Automatic matching runs for the new item cleanly", async () => {
    const matches = await runAutomaticMatching(createdItemId);
    expect(Array.isArray(matches)).toBe(true);
  });

  it("6. Cleans up test specimen", async () => {
    if (createdItemId) {
      await prisma.notification.deleteMany({
        where: { title: { contains: "Beats Studio Pro" } },
      });
      await prisma.sighting.deleteMany({ where: { itemId: createdItemId } });
      await prisma.item.delete({ where: { id: createdItemId } });
    }
  });
});
