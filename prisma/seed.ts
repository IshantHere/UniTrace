import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting UniTrace Seed...");

  // Clean existing tables to guarantee deterministic, repeatable seeds
  await prisma.rewardRedemption.deleteMany({});
  await prisma.rewardPerk.deleteMany({});
  await prisma.creditTransaction.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.handoverRecord.deleteMany({});
  await prisma.claim.deleteMany({});
  await prisma.matchEvidence.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.sighting.deleteMany({});
  await prisma.visualFingerprint.deleteMany({});
  await prisma.embedding.deleteMany({});
  await prisma.duplicateCluster.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.campus.deleteMany({});
  await prisma.institution.deleteMany({});

  // 1. Create Default Institution
  const institution = await prisma.institution.upsert({
    where: { slug: "apex" },
    update: {},
    create: {
      id: "inst_apex_university",
      name: "Apex University",
      slug: "apex",
      domain: "apex.edu",
      settingsJson: JSON.stringify({
        highValueVerificationRequired: true,
        autoMatchThreshold: 0.75,
        defaultRetentionDays: 60,
      }),
    },
  });

  // 2. Create Campus
  const campus = await prisma.campus.upsert({
    where: {
      institutionId_code: {
        institutionId: institution.id,
        code: "MAIN",
      },
    },
    update: {},
    create: {
      id: "campus_apex_main",
      institutionId: institution.id,
      name: "Main Academic Campus",
      code: "MAIN",
      centerLat: 37.7749,
      centerLng: -122.4194,
    },
  });

  // 3. Create Locations
  const locLibrarySteps = await prisma.location.create({
    data: {
      id: "loc_library_steps",
      campusId: campus.id,
      name: "Main Library - North Entrance Steps",
      building: "Main Library",
      floor: "Ground",
      roomOrArea: "North Entrance & Plaza Steps",
      latitude: 37.7749,
      longitude: -122.4194,
      isSecurityDesk: false,
    },
  });

  const locLibraryDesk = await prisma.location.create({
    data: {
      id: "loc_library_desk",
      campusId: campus.id,
      name: "Main Library - Circulation & Service Desk",
      building: "Main Library",
      floor: "1st Floor",
      roomOrArea: "Information Commons Entrance",
      latitude: 37.7751,
      longitude: -122.4191,
      isSecurityDesk: false,
    },
  });

  const locBlock32 = await prisma.location.create({
    data: {
      id: "loc_block_32",
      campusId: campus.id,
      name: "Block 32 - Science & Tech Courtyard",
      building: "Block 32",
      floor: "Ground",
      roomOrArea: "Courtyard Covered Walkway",
      latitude: 37.7758,
      longitude: -122.4182,
      isSecurityDesk: false,
    },
  });

  const locSecurityDesk = await prisma.location.create({
    data: {
      id: "loc_security_desk",
      campusId: campus.id,
      name: "Campus Central Security & Lost/Found Hub",
      building: "Administration Building",
      floor: "Ground",
      roomOrArea: "Room 104 Security Depot",
      latitude: 37.7765,
      longitude: -122.4175,
      isSecurityDesk: true,
    },
  });

  const locStudentUnion = await prisma.location.create({
    data: {
      id: "loc_student_union",
      campusId: campus.id,
      name: "Student Union - Dining Hall & Atrium",
      building: "Student Union",
      floor: "2nd Floor",
      roomOrArea: "Central Dining Court",
      latitude: 37.7735,
      longitude: -122.421,
      isSecurityDesk: false,
    },
  });

  const locEngineering = await prisma.location.create({
    data: {
      id: "loc_engineering",
      campusId: campus.id,
      name: "Engineering Hall - Robotics Lab 402",
      building: "Engineering Hall",
      floor: "4th Floor",
      roomOrArea: "Advanced Robotics Lab",
      latitude: 37.777,
      longitude: -122.416,
      isSecurityDesk: false,
    },
  });

  // 4. Create Categories
  const catAudio = await prisma.category.create({
    data: {
      id: "cat_audio",
      institutionId: institution.id,
      name: "Audio & Headphones",
      slug: "audio-headphones",
      icon: "Headphones",
      isHighValue: true,
      verificationSchemaJson: JSON.stringify({
        questions: [
          "Describe any stickers, protective cases, or skin on the case or buds.",
          "Are there any distinct scratches, marks, or color variations?",
          "What is the approximate device serial number or Bluetooth name?",
        ],
      }),
    },
  });

  const catComputing = await prisma.category.create({
    data: {
      id: "cat_computing",
      institutionId: institution.id,
      name: "Laptops & Tablets",
      slug: "laptops-tablets",
      icon: "Laptop",
      isHighValue: true,
      verificationSchemaJson: JSON.stringify({
        questions: [
          "What brand and screen size is the device?",
          "Describe any stickers, skins, or distinctive scratches on the exterior.",
          "Can you provide the lockscreen wallpaper description or partial serial number?",
        ],
      }),
    },
  });

  const catBags = await prisma.category.create({
    data: {
      id: "cat_bags",
      institutionId: institution.id,
      name: "Bags, Sleeves & Backpacks",
      slug: "bags-backpacks",
      icon: "Briefcase",
      isHighValue: false,
    },
  });

  const catBottles = await prisma.category.create({
    data: {
      id: "cat_bottles",
      institutionId: institution.id,
      name: "Water Bottles & Thermoses",
      slug: "bottles-tumblers",
      icon: "Coffee",
      isHighValue: false,
    },
  });

  const catWallets = await prisma.category.create({
    data: {
      id: "cat_wallets",
      institutionId: institution.id,
      name: "Wallets & Cards",
      slug: "wallets-cards",
      icon: "CreditCard",
      isHighValue: true,
    },
  });

  // 5. Create Users (Password: Password123!)
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const studentAlex = await prisma.user.create({
    data: {
      id: "user_student_alex",
      institutionId: institution.id,
      name: "Alex Sharma",
      email: "student@apex.edu",
      passwordHash,
      role: "STUDENT",
      studentOrStaffId: "STU-2024-8841",
      phone: "+1-555-0192",
      points: 115,
      credits: 115,
      tier: "SILVER",
    },
  });

  const finderMaya = await prisma.user.create({
    data: {
      id: "user_finder_maya",
      institutionId: institution.id,
      name: "Maya Lin",
      email: "finder@apex.edu",
      passwordHash,
      role: "STUDENT",
      studentOrStaffId: "STU-2024-9102",
      phone: "+1-555-0144",
      points: 265,
      credits: 265,
      tier: "SILVER",
    },
  });

  const finderSam = await prisma.user.create({
    data: {
      id: "user_finder_sam",
      institutionId: institution.id,
      name: "Sam Taylor",
      email: "sam@apex.edu",
      passwordHash,
      role: "STUDENT",
      studentOrStaffId: "STU-2024-3319",
      phone: "+1-555-0812",
      points: 420,
      credits: 420,
      tier: "GOLD",
    },
  });

  const finderJordan = await prisma.user.create({
    data: {
      id: "user_finder_jordan",
      institutionId: institution.id,
      name: "Jordan Patel",
      email: "jordan@apex.edu",
      passwordHash,
      role: "STUDENT",
      studentOrStaffId: "STU-2024-7721",
      phone: "+1-555-0319",
      points: 85,
      credits: 85,
      tier: "BRONZE",
    },
  });

  const staffOfficer = await prisma.user.create({
    data: {
      id: "user_staff_vance",
      institutionId: institution.id,
      name: "Officer David Vance",
      email: "staff@apex.edu",
      passwordHash,
      role: "STAFF",
      studentOrStaffId: "SEC-OFFICER-44",
      phone: "+1-555-0911",
    },
  });

  const adminDean = await prisma.user.create({
    data: {
      id: "user_admin_jenkins",
      institutionId: institution.id,
      name: "Dean Sarah Jenkins",
      email: "admin@apex.edu",
      passwordHash,
      role: "ADMIN",
      studentOrStaffId: "ADM-DEAN-01",
    },
  });

  const superAdmin = await prisma.user.create({
    data: {
      id: "user_super_admin",
      institutionId: institution.id,
      name: "System Administrator",
      email: "superadmin@unitrace.io",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  // 6. Create Storyline Item 1: LOST AirPods Case (Alex Sharma)
  const lostAirPods = await prisma.item.create({
    data: {
      id: "item_lost_airpods",
      institutionId: institution.id,
      reporterId: studentAlex.id,
      type: "LOST",
      title: "Apple AirPods Pro Case with Blue Sticker",
      description:
        "Lost my white Apple AirPods Pro case near the Main Library steps around 4:30 PM. It has a small circular blue sticker on the top lid and a faint scratch near the bottom hinge.",
      categoryId: catAudio.id,
      primaryLocationId: locLibrarySteps.id,
      incidentDate: new Date("2026-09-10T16:30:00Z"),
      incidentTime: "16:30",
      status: "MATCH_PENDING",
      isHighValue: true,
      privateNotes: "Bluetooth name is 'Alex's AirDrop'. Circular NASA blue sticker on lid.",
      images: {
        create: {
          url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=150&q=80",
          isPrimary: true,
        },
      },
      visualFingerprint: {
        create: {
          category: "Electronics",
          subcategory: "Audio Accessories",
          primaryColor: "White",
          secondaryColorsJson: JSON.stringify(["Silver", "Blue"]),
          shape: "Compact Curved Rectangular",
          material: "Glossy Polycarbonate",
          brand: "Apple",
          logo: "Apple embossed indicator",
          stickers: "Small circular blue sticker on top lid",
          scratches: "Minor surface scuff near bottom hinge",
          accessories: "Bare case without silicone wrap",
          condition: "Used - Good",
          distinctiveFeatures: JSON.stringify([
            "Small circular blue sticker on top lid",
            "Minor surface scuff near bottom hinge",
          ]),
          confidenceScores: JSON.stringify({
            brand: 0.96,
            primaryColor: 0.99,
            stickers: 0.93,
            scratches: 0.85,
          }),
        },
      },
    },
  });

  // 7. Create Storyline Item 2: FOUND AirPods Case (Maya Lin turned in to Staff)
  const foundAirPods = await prisma.item.create({
    data: {
      id: "item_found_airpods",
      institutionId: institution.id,
      reporterId: finderMaya.id,
      type: "FOUND",
      title: "White Wireless Earbuds Case found at Library Entrance",
      description:
        "Found a white Apple earbud charging case on a concrete ledge near the library entrance. Item has a distinct blue round sticker on top and is currently secured at the security desk.",
      categoryId: catAudio.id,
      primaryLocationId: locLibraryDesk.id,
      incidentDate: new Date("2026-09-10T17:05:00Z"),
      incidentTime: "17:05",
      status: "UNDER_VERIFICATION",
      isHighValue: true,
      privateNotes: "Inspected by Officer Vance: Blue circular sticker on lid matches, minor scuff on hinge.",
      images: {
        create: {
          url: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=150&q=80",
          isPrimary: true,
        },
      },
      visualFingerprint: {
        create: {
          category: "Electronics",
          subcategory: "Audio Accessories",
          primaryColor: "White",
          secondaryColorsJson: JSON.stringify(["Silver", "Blue"]),
          shape: "Compact Curved Rectangular",
          material: "Glossy Polycarbonate",
          brand: "Apple",
          stickers: "Round blue sticker on top cover",
          scratches: "Fine scuff mark near bottom hinge",
          condition: "Used - Good",
          distinctiveFeatures: JSON.stringify([
            "Round blue sticker on top cover",
            "Fine scuff mark near bottom hinge",
          ]),
          confidenceScores: JSON.stringify({
            brand: 0.95,
            primaryColor: 0.98,
            stickers: 0.91,
            scratches: 0.82,
          }),
        },
      },
    },
  });

  // 8. Create Match between Lost & Found AirPods (94% Score)
  const matchRecord = await prisma.match.create({
    data: {
      id: "match_airpods_golden",
      lostItemId: lostAirPods.id,
      foundItemId: foundAirPods.id,
      overallScore: 0.94,
      visualScore: 0.96,
      semanticScore: 0.93,
      attributeScore: 0.95,
      locationScore: 0.92,
      timeScore: 0.94,
      status: "POTENTIAL",
      confidenceTier: "EXCEPTIONAL",
      evidence: {
        create: [
          {
            signalType: "CATEGORY_MATCH",
            description: "Identical object category: Audio & Headphones / Charging Case",
            score: 1.0,
            weight: 0.2,
          },
          {
            signalType: "STICKER_FINGERPRINT",
            description: "Distinctive blue circular sticker identified on top lid in both reports",
            score: 0.96,
            weight: 0.25,
          },
          {
            signalType: "COLOR_AGREEMENT",
            description: "Matching white primary finish with silver hinge accents",
            score: 0.98,
            weight: 0.15,
          },
          {
            signalType: "SPATIAL_PROXIMITY",
            description: "Locations are within 140 meters (Library Steps -> Library Entrance)",
            score: 0.92,
            weight: 0.2,
          },
          {
            signalType: "TEMPORAL_COMPATIBILITY",
            description: "Reported found 35 minutes after lost timestamp (16:30 -> 17:05)",
            score: 0.94,
            weight: 0.2,
          },
        ],
      },
    },
  });

  // 9. Create Probable Item Journey Sightings
  await prisma.sighting.createMany({
    data: [
      {
        itemId: foundAirPods.id,
        locationId: locLibrarySteps.id,
        timestamp: new Date("2026-09-10T16:30:00Z"),
        sightingType: "OBSERVED",
        confidence: 1.0,
        reportedBy: "Alex Sharma (Lost Reporter)",
        notes: "Last possessed by owner while studying at outdoor steps.",
        sequenceOrder: 1,
      },
      {
        itemId: foundAirPods.id,
        locationId: locLibraryDesk.id,
        timestamp: new Date("2026-09-10T17:05:00Z"),
        sightingType: "OBSERVED",
        confidence: 1.0,
        reportedBy: "Maya Lin (Campus Good Samaritan)",
        notes: "Picked up from stone ledge and handed to circulation desk.",
        sequenceOrder: 2,
      },
      {
        itemId: foundAirPods.id,
        locationId: locBlock32.id,
        timestamp: new Date("2026-09-10T17:22:00Z"),
        sightingType: "AI_INFERRED",
        confidence: 0.82,
        reportedBy: "UniTrace Trajectory Engine",
        notes: "Probable transit corridor: Library courier route via Block 32 Courtyard.",
        sequenceOrder: 3,
      },
      {
        itemId: foundAirPods.id,
        locationId: locSecurityDesk.id,
        timestamp: new Date("2026-09-10T17:45:00Z"),
        sightingType: "OBSERVED",
        confidence: 1.0,
        reportedBy: "Officer David Vance (Campus Security)",
        notes: "Logged into Security Depot Locker #12. Ready for verification.",
        sequenceOrder: 4,
      },
    ],
  });

  // 10. Create Golden Claim & Handover Station
  const goldenClaim = await prisma.claim.create({
    data: {
      id: "claim_airpods_golden",
      itemId: foundAirPods.id,
      claimantId: studentAlex.id,
      lostItemId: lostAirPods.id,
      status: "UNDER_REVIEW",
      verificationLevel: "HIGH_VALUE_STRICT",
      claimantNotes: "I can provide the Bluetooth pairing screenshot and describe the exact sticker size.",
      verifications: {
        create: [
          {
            question: "Describe any distinctive stickers, skins, or engravings on the case.",
            claimantAnswer: "A small circular blue NASA logo sticker on the top cover, approximately 1.5cm wide.",
            isCorrect: true,
            reviewerNotes: "Exact visual match with secured property in locker #12.",
          },
          {
            question: "Are there any specific scratches or surface flaws?",
            claimantAnswer: "A minor gray scuff near the lower back hinge from dropping it on concrete.",
            isCorrect: true,
            reviewerNotes: "Verified under desk magnifier.",
          },
        ],
      },
      handoverRecord: {
        create: {
          staffUserId: staffOfficer.id,
          handoverCode: "RC-8841",
          handoverLocationId: locSecurityDesk.id,
          idVerificationMethod: "STUDENT_ID_CARD",
          notes: "Verification PIN generated. Awaiting student arrival with ID card STU-2024-8841.",
        },
      },
    },
  });

  // 11. Create Notifications
  await prisma.notification.create({
    data: {
      userId: studentAlex.id,
      type: "HIGH_CONFIDENCE_MATCH",
      title: "94% Match Found for your AirPods Case!",
      message:
        "UniTrace AI found an exceptional match reported at the Main Library. Distinctive blue sticker confirmed.",
      actionUrl: `/match/${matchRecord.id}`,
    },
  });

  // 12. Create Representative Items for Duplicate Cluster Demo
  const hydroFlask1 = await prisma.item.create({
    data: {
      id: "item_hydroflask_1",
      institutionId: institution.id,
      reporterId: finderMaya.id,
      type: "FOUND",
      title: "Blue Hydro Flask 32oz with mountain sticker",
      description: "Found navy blue insulated water bottle with REI mountain sticker in Student Union cafeteria.",
      categoryId: catBottles.id,
      primaryLocationId: locStudentUnion.id,
      incidentDate: new Date("2026-09-09T14:00:00Z"),
      status: "ACTIVE",
      images: {
        create: {
          url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
          isPrimary: true,
        },
      },
    },
  });

  const hydroFlask2 = await prisma.item.create({
    data: {
      id: "item_hydroflask_2",
      institutionId: institution.id,
      reporterId: studentAlex.id,
      type: "FOUND",
      title: "Navy blue water bottle near cafeteria counter",
      description: "Someone left a dark blue water flask with outdoor sticker on dining table #4.",
      categoryId: catBottles.id,
      primaryLocationId: locStudentUnion.id,
      incidentDate: new Date("2026-09-09T14:15:00Z"),
      status: "ACTIVE",
      images: {
        create: {
          url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
          isPrimary: true,
        },
      },
    },
  });

  // Duplicate cluster
  const dupCluster = await prisma.duplicateCluster.create({
    data: {
      id: "cluster_hydroflask",
      institutionId: institution.id,
      status: "SUGGESTED",
      averageSimilarity: 0.91,
      members: {
        create: [
          { itemId: hydroFlask1.id, similarityToCanonical: 1.0 },
          { itemId: hydroFlask2.id, similarityToCanonical: 0.91 },
        ],
      },
    },
  });

  // 12. Seed Campus Reward Perks Store Catalog
  await prisma.rewardPerk.createMany({
    data: [
      {
        id: "perk_coffee_voucher",
        title: "Apex Café Artisan Coffee Voucher",
        description: "Redeem 1 free handcrafted espresso, cold brew, or matcha latte at the Student Union Café.",
        costCredits: 60,
        category: "DINING",
        icon: "coffee",
        stock: 50,
      },
      {
        id: "perk_bookstore_discount",
        title: "Apex Bookstore 20% Off Coupon",
        description: "Get 20% off any single academic textbook, stationery item, or campus merchandise.",
        costCredits: 120,
        category: "CAMPUS_STORE",
        icon: "book",
        stock: 35,
      },
      {
        id: "perk_library_reserve",
        title: "Library Extended 14-Day Reserve Pass",
        description: "Extend your borrowing limit and renewal period by 14 additional days with zero late fines.",
        costCredits: 100,
        category: "ACADEMIC",
        icon: "bookmark",
        stock: 100,
      },
      {
        id: "perk_study_pod",
        title: "Quiet Study Pod 3-Hour Pass",
        description: "Guaranteed private, noise-canceling study pod booking in the Engineering Hall Library.",
        costCredits: 150,
        category: "ACADEMIC",
        icon: "clock",
        stock: 20,
      },
      {
        id: "perk_day_parking",
        title: "Campus Day Parking Pass",
        description: "Full-day validated parking voucher in Zone A & B campus visitor garages.",
        costCredits: 200,
        category: "PARKING",
        icon: "car",
        stock: 15,
      },
      {
        id: "perk_swag_pack",
        title: "Apex University Tech & Swag Pack",
        description: "Official Apex University hydro-insulated tumbler, hoodie, laptop sleeve, and stickers.",
        costCredits: 350,
        category: "MERCH",
        icon: "gift",
        stock: 10,
      },
    ],
  });

  // Seed initial ledger transactions for Maya Lin (finder)
  await prisma.creditTransaction.createMany({
    data: [
      {
        userId: finderMaya.id,
        amount: 15,
        balanceAfter: 15,
        type: "FOUND_ITEM_REPORTED",
        description: "Reported found item: Apple AirPods Pro Case",
      },
      {
        userId: finderMaya.id,
        amount: 200,
        balanceAfter: 215,
        type: "HANDOVER_COMPLETED",
        description: "Returned 'MacBook Pro 14': Handover verified at Security Desk (+100), Speedy return bonus (<48h) (+50), High-value custody bonus (+50)",
      },
      {
        userId: finderMaya.id,
        amount: 50,
        balanceAfter: 265,
        type: "HANDOVER_COMPLETED",
        description: "Returned 'Hydro Flask Bottle': Handover verified (+50)",
      },
    ],
  });

  // Seed ledger transactions for Sam Taylor (top finder)
  await prisma.creditTransaction.createMany({
    data: [
      {
        userId: finderSam.id,
        amount: 15,
        balanceAfter: 15,
        type: "FOUND_ITEM_REPORTED",
        description: "Reported found item: TI-84 Calculator",
      },
      {
        userId: finderSam.id,
        amount: 200,
        balanceAfter: 215,
        type: "HANDOVER_COMPLETED",
        description: "Returned 'iPhone 15 Pro': Security Desk verification (+200)",
      },
      {
        userId: finderSam.id,
        amount: 205,
        balanceAfter: 420,
        type: "HANDOVER_COMPLETED",
        description: "Returned 'Car Keys with Apex Lanyard' (+205)",
      },
    ],
  });

  // 13. Create Initial Institution Audit Log
  await prisma.auditLog.create({
    data: {
      institutionId: institution.id,
      actorId: adminDean.id,
      action: "INSTITUTION_INITIALIZED",
      entityType: "Institution",
      entityId: institution.id,
      metadata: JSON.stringify({ name: institution.name }),
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`- Institution: ${institution.name}`);
  console.log(`- Campuses & Locations: ${campus.name} (6 locations created)`);
  console.log(`- Users: 5 accounts created (password: Password123!)`);
  console.log(`  * Student: student@apex.edu`);
  console.log(`  * Finder: finder@apex.edu`);
  console.log(`  * Staff: staff@apex.edu`);
  console.log(`  * Admin: admin@apex.edu`);
  console.log(`  * Super Admin: superadmin@unitrace.io`);
  console.log(`- Golden Storyline: Match ID ${matchRecord.id} (94% Score) with Journey & Handover PIN RC-8841`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
