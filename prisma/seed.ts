import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data in reverse dependency order
  await prisma.memberVerification.deleteMany();
  await prisma.churchVerificationRequest.deleteMany();
  await prisma.invitationAnalytics.deleteMany();
  await prisma.churchInvitation.deleteMany();
  await prisma.item.deleteMany();
  await prisma.church.deleteMany();
  await prisma.inviteCode.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared existing data");

  // Hash password for all users
  const hashedPassword = await hash("Test1234", 12);

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: "john-admin@test.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Administrator",
      role: "ADMIN",
      bio: "System administrator for InHouse platform",
      phone: "+1-555-0100",
      address: "123 Admin Street",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      latitude: 29.7604,
      longitude: -95.3698,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log("👤 Created admin user");

  // 2. Create Church Lead Contact Users (will become church leads)
  const churchLeads = await Promise.all([
    // Lake Charles, LA - Approved
    prisma.user.create({
      data: {
        email: "stacy-church@test.com",
        password: hashedPassword,
        firstName: "Stacy",
        lastName: "Williams",
        role: "CHURCH",
        bio: "Lead Pastor at Grace Community Church. Passionate about community outreach and helping families in need.",
        phone: "+1-337-555-0201",
        address: "1245 Ryan Street",
        city: "Lake Charles",
        state: "LA",
        zipCode: "70601",
        latitude: 30.2266,
        longitude: -93.2174,
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Baton Rouge, LA - Approved
    prisma.user.create({
      data: {
        email: "michael-church@test.com",
        password: hashedPassword,
        firstName: "Michael",
        lastName: "Thompson",
        role: "CHURCH",
        bio: "Senior Pastor with 15 years of ministry experience. Committed to serving our local community.",
        phone: "+1-225-555-0202",
        address: "789 Government Street",
        city: "Baton Rouge",
        state: "LA",
        zipCode: "70802",
        latitude: 30.4515,
        longitude: -91.1871,
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Mobile, AL - Approved
    prisma.user.create({
      data: {
        email: "sarah-church@test.com",
        password: hashedPassword,
        firstName: "Sarah",
        lastName: "Johnson",
        role: "CHURCH",
        bio: "Youth Pastor turned Lead Pastor. Focused on building bridges in our community through service.",
        phone: "+1-251-555-0203",
        address: "456 Government Street",
        city: "Mobile",
        state: "AL",
        zipCode: "36602",
        latitude: 30.6944,
        longitude: -88.0431,
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Pensacola, FL - Pending
    prisma.user.create({
      data: {
        email: "david-church@test.com",
        password: hashedPassword,
        firstName: "David",
        lastName: "Martinez",
        role: "USER", // Will be updated to CHURCH when approved
        bio: "Assistant Pastor seeking to establish our church's presence on InHouse platform.",
        phone: "+1-850-555-0204",
        address: "321 Palafox Street",
        city: "Pensacola",
        state: "FL",
        zipCode: "32502",
        latitude: 30.4213,
        longitude: -87.2169,
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Jacksonville, FL - Pending
    prisma.user.create({
      data: {
        email: "maria-church@test.com",
        password: hashedPassword,
        firstName: "Maria",
        lastName: "Rodriguez",
        role: "USER", // Will be updated to CHURCH when approved
        bio: "Church administrator handling our application to join the InHouse community.",
        phone: "+1-904-555-0205",
        address: "987 Main Street",
        city: "Jacksonville",
        state: "FL",
        zipCode: "32202",
        latitude: 30.3322,
        longitude: -81.6557,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
  ]);

  console.log("⛪ Created church lead users");

  // 3. Create Churches (3 approved, 2 pending)
  const churches = await Promise.all([
    // Grace Community Church - Lake Charles, LA
    prisma.church.create({
      data: {
        name: "Grace Community Church",
        leadPastorName: "Pastor Stacy Williams",
        website: "https://gracecommunity-lc.org",
        address: "1245 Ryan Street",
        city: "Lake Charles",
        state: "LA",
        zipCode: "70601",
        latitude: 30.2266,
        longitude: -93.2174,
        applicationStatus: "APPROVED",
        leadContactId: churchLeads[0].id,
        requiresVerification: true,
        minVerificationsRequired: 2,
      },
    }),

    // First Baptist Church - Baton Rouge, LA
    prisma.church.create({
      data: {
        name: "First Baptist Church of Baton Rouge",
        leadPastorName: "Pastor Michael Thompson",
        website: "https://fbcbr.org",
        address: "789 Government Street",
        city: "Baton Rouge",
        state: "LA",
        zipCode: "70802",
        latitude: 30.4515,
        longitude: -91.1871,
        applicationStatus: "APPROVED",
        leadContactId: churchLeads[1].id,
        requiresVerification: true,
        minVerificationsRequired: 3,
      },
    }),

    // Hope Fellowship - Mobile, AL
    prisma.church.create({
      data: {
        name: "Hope Fellowship Church",
        leadPastorName: "Pastor Sarah Johnson",
        website: "https://hopefellowshipmobile.com",
        address: "456 Government Street",
        city: "Mobile",
        state: "AL",
        zipCode: "36602",
        latitude: 30.6944,
        longitude: -88.0431,
        applicationStatus: "APPROVED",
        leadContactId: churchLeads[2].id,
        requiresVerification: false,
        minVerificationsRequired: 1,
      },
    }),

    // New Life Church - Pensacola, FL (Pending)
    prisma.church.create({
      data: {
        name: "New Life Community Church",
        leadPastorName: "Pastor David Martinez",
        website: "https://newlifepensacola.org",
        address: "321 Palafox Street",
        city: "Pensacola",
        state: "FL",
        zipCode: "32502",
        latitude: 30.4213,
        longitude: -87.2169,
        applicationStatus: "PENDING",
        leadContactId: churchLeads[3].id,
        requiresVerification: true,
        minVerificationsRequired: 2,
      },
    }),

    // Cornerstone Church - Jacksonville, FL (Pending)
    prisma.church.create({
      data: {
        name: "Cornerstone Church",
        leadPastorName: "Pastor Maria Rodriguez",
        website: "https://cornerstonejax.com",
        address: "987 Main Street",
        city: "Jacksonville",
        state: "FL",
        zipCode: "32202",
        latitude: 30.3322,
        longitude: -81.6557,
        applicationStatus: "PENDING",
        leadContactId: churchLeads[4].id,
        requiresVerification: true,
        minVerificationsRequired: 2,
      },
    }),
  ]);

  console.log("🏛️ Created churches");

  // 4. Create Regular Users (10-12 with varying completeness)
  const regularUsers = await Promise.all([
    // Complete profile, verified church member
    prisma.user.create({
      data: {
        email: "dale-user@test.com",
        password: hashedPassword,
        firstName: "Dale",
        lastName: "Anderson",
        role: "USER",
        bio: "Active church member and community volunteer. Love helping families in need.",
        phone: "+1-337-555-0301",
        address: "456 Oak Street",
        city: "Lake Charles",
        state: "LA",
        zipCode: "70601",
        latitude: 30.2266,
        longitude: -93.2174,
        churchId: churches[0].id,
        churchMembershipStatus: "VERIFIED",
        verifiedAt: new Date(),
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Incomplete profile, verified member
    prisma.user.create({
      data: {
        email: "jenny-user@test.com",
        password: hashedPassword,
        firstName: "Jenny",
        lastName: "Davis",
        role: "USER",
        phone: "+1-225-555-0302",
        city: "Baton Rouge",
        state: "LA",
        churchId: churches[1].id,
        churchMembershipStatus: "VERIFIED",
        verifiedAt: new Date(),
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Complete profile, requested membership
    prisma.user.create({
      data: {
        email: "carlos-user@test.com",
        password: hashedPassword,
        firstName: "Carlos",
        lastName: "Garcia",
        role: "USER",
        bio: "New to the area and looking to get involved with the church community.",
        phone: "+1-251-555-0303",
        address: "789 Pine Avenue",
        city: "Mobile",
        state: "AL",
        zipCode: "36602",
        latitude: 30.6944,
        longitude: -88.0431,
        churchId: churches[2].id,
        churchMembershipStatus: "REQUESTED",
        churchJoinRequestedAt: new Date(),
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Minimal profile, no church
    prisma.user.create({
      data: {
        email: "lisa-user@test.com",
        password: hashedPassword,
        firstName: "Lisa",
        role: "USER",
        city: "Pensacola",
        state: "FL",
        churchMembershipStatus: "NONE",
        isActive: true,
      },
    }),

    // Complete profile, verified member (Grace Community)
    prisma.user.create({
      data: {
        email: "robert-user@test.com",
        password: hashedPassword,
        firstName: "Robert",
        lastName: "Wilson",
        role: "USER",
        bio: "Long-time church member, happy to verify new members.",
        phone: "+1-337-555-0305",
        address: "123 Main Street",
        city: "Lake Charles",
        state: "LA",
        zipCode: "70601",
        latitude: 30.2266,
        longitude: -93.2174,
        churchId: churches[0].id,
        churchMembershipStatus: "VERIFIED",
        verifiedAt: new Date(),
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Partial profile, verified member (First Baptist)
    prisma.user.create({
      data: {
        email: "susan-user@test.com",
        password: hashedPassword,
        firstName: "Susan",
        lastName: "Brown",
        role: "USER",
        bio: "Church treasurer and community outreach coordinator.",
        address: "567 College Drive",
        city: "Baton Rouge",
        state: "LA",
        zipCode: "70802",
        churchId: churches[1].id,
        churchMembershipStatus: "VERIFIED",
        verifiedAt: new Date(),
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Complete profile, no church affiliation
    prisma.user.create({
      data: {
        email: "james-user@test.com",
        password: hashedPassword,
        firstName: "James",
        lastName: "Taylor",
        role: "USER",
        bio: "Recently moved to the area, exploring local churches.",
        phone: "+1-850-555-0307",
        address: "890 University Ave",
        city: "Pensacola",
        state: "FL",
        zipCode: "32502",
        latitude: 30.4213,
        longitude: -87.2169,
        churchMembershipStatus: "NONE",
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Minimal profile, rejected membership
    prisma.user.create({
      data: {
        email: "patricia-user@test.com",
        password: hashedPassword,
        firstName: "Patricia",
        role: "USER",
        city: "Mobile",
        state: "AL",
        churchId: churches[2].id,
        churchMembershipStatus: "REJECTED",
        isActive: true,
      },
    }),

    // Complete profile, verified (Hope Fellowship)
    prisma.user.create({
      data: {
        email: "kevin-user@test.com",
        password: hashedPassword,
        firstName: "Kevin",
        lastName: "Miller",
        role: "USER",
        bio: "Youth group leader and volunteer coordinator.",
        phone: "+1-251-555-0309",
        address: "234 Spring Hill Ave",
        city: "Mobile",
        state: "AL",
        zipCode: "36602",
        latitude: 30.6944,
        longitude: -88.0431,
        churchId: churches[2].id,
        churchMembershipStatus: "VERIFIED",
        verifiedAt: new Date(),
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Partial profile, requested membership (First Baptist)
    prisma.user.create({
      data: {
        email: "nancy-user@test.com",
        password: hashedPassword,
        firstName: "Nancy",
        lastName: "Jones",
        role: "USER",
        phone: "+1-225-555-0310",
        city: "Baton Rouge",
        state: "LA",
        churchId: churches[1].id,
        churchMembershipStatus: "REQUESTED",
        churchJoinRequestedAt: new Date(),
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Complete profile, verified (Grace Community)
    prisma.user.create({
      data: {
        email: "thomas-user@test.com",
        password: hashedPassword,
        firstName: "Thomas",
        lastName: "Moore",
        role: "USER",
        bio: "Deacon and long-time member of Grace Community Church.",
        phone: "+1-337-555-0311",
        address: "678 Kirkman Street",
        city: "Lake Charles",
        state: "LA",
        zipCode: "70601",
        latitude: 30.2266,
        longitude: -93.2174,
        churchId: churches[0].id,
        churchMembershipStatus: "VERIFIED",
        verifiedAt: new Date(),
        isActive: true,
        emailVerified: new Date(),
      },
    }),

    // Inactive user
    prisma.user.create({
      data: {
        email: "inactive-user@test.com",
        password: hashedPassword,
        firstName: "Inactive",
        lastName: "User",
        role: "USER",
        isActive: false,
        churchMembershipStatus: "NONE",
      },
    }),
  ]);

  console.log("👥 Created regular users");

  // 5. Create Items (3-5 per approved church)
  const items = [];

  // Grace Community Church Items
  const graceItems = await Promise.all([
    prisma.item.create({
      data: {
        title: "Baby Crib and Mattress",
        description:
          "Gently used wooden crib with organic mattress. Perfect for newborns to 2 years old.",
        category: "Baby & Kids",
        latitude: 30.2266,
        longitude: -93.2174,
        address: "1245 Ryan Street",
        city: "Lake Charles",
        state: "LA",
        zipCode: "70601",
        status: "AVAILABLE",
        moderationStatus: "APPROVED",
        churchId: churches[0].id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Winter Coats (Various Sizes)",
        description:
          "Collection of clean winter coats for children and adults. Sizes S-XL available.",
        category: "Clothing",
        latitude: 30.2266,
        longitude: -93.2174,
        address: "1245 Ryan Street",
        city: "Lake Charles",
        state: "LA",
        zipCode: "70601",
        status: "CLAIMED",
        moderationStatus: "APPROVED",
        claimerId: regularUsers[1].id,
        claimedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        churchId: churches[0].id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Dining Table Set",
        description:
          "4-person dining table with chairs. Some wear but very functional.",
        category: "Furniture",
        latitude: 30.2266,
        longitude: -93.2174,
        address: "1245 Ryan Street",
        city: "Lake Charles",
        state: "LA",
        zipCode: "70601",
        status: "COMPLETED",
        moderationStatus: "APPROVED",
        claimerId: regularUsers[4].id,
        claimedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        churchId: churches[0].id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Children's Books Collection",
        description:
          "Large collection of children's books, ages 3-12. Educational and fun!",
        category: "Books & Education",
        latitude: 30.2266,
        longitude: -93.2174,
        address: "1245 Ryan Street",
        city: "Lake Charles",
        state: "LA",
        zipCode: "70601",
        status: "AVAILABLE",
        moderationStatus: "PENDING",
        churchId: churches[0].id,
      },
    }),
  ]);

  // First Baptist Church Items
  const baptistItems = await Promise.all([
    prisma.item.create({
      data: {
        title: "Refrigerator (Working)",
        description:
          "Full-size refrigerator in good working condition. Moving and need gone ASAP.",
        category: "Appliances",
        latitude: 30.4515,
        longitude: -91.1871,
        address: "789 Government Street",
        city: "Baton Rouge",
        state: "LA",
        zipCode: "70802",
        status: "AVAILABLE",
        moderationStatus: "APPROVED",
        churchId: churches[1].id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Men's Work Boots",
        description:
          "Size 10 steel-toe work boots, barely used. Perfect for construction work.",
        category: "Clothing",
        latitude: 30.4515,
        longitude: -91.1871,
        address: "789 Government Street",
        city: "Baton Rouge",
        state: "LA",
        zipCode: "70802",
        status: "CLAIMED",
        moderationStatus: "APPROVED",
        claimerId: regularUsers[2].id,
        claimedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        churchId: churches[1].id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Baby Stroller and Car Seat",
        description:
          "Travel system with stroller and infant car seat. Expires 2027.",
        category: "Baby & Kids",
        latitude: 30.4515,
        longitude: -91.1871,
        address: "789 Government Street",
        city: "Baton Rouge",
        state: "LA",
        zipCode: "70802",
        status: "AVAILABLE",
        moderationStatus: "APPROVED",
        churchId: churches[1].id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Inappropriate Content Item",
        description:
          "This item contains inappropriate content and should be rejected.",
        category: "Other",
        latitude: 30.4515,
        longitude: -91.1871,
        address: "789 Government Street",
        city: "Baton Rouge",
        state: "LA",
        zipCode: "70802",
        status: "AVAILABLE",
        moderationStatus: "REJECTED",
        moderationNotes:
          "Inappropriate content. Does not align with community guidelines.",
        churchId: churches[1].id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Laptop Computer",
        description:
          "Older laptop computer, good for basic tasks and schoolwork.",
        category: "Electronics",
        latitude: 30.4515,
        longitude: -91.1871,
        address: "789 Government Street",
        city: "Baton Rouge",
        state: "LA",
        zipCode: "70802",
        status: "COMPLETED",
        moderationStatus: "APPROVED",
        claimerId: regularUsers[6].id,
        claimedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        churchId: churches[1].id,
      },
    }),
  ]);

  // Hope Fellowship Items
  const hopeItems = await Promise.all([
    prisma.item.create({
      data: {
        title: "Queen Size Bed Frame",
        description:
          "Solid wood queen bed frame, no mattress included. Easy assembly.",
        category: "Furniture",
        latitude: 30.6944,
        longitude: -88.0431,
        address: "456 Government Street",
        city: "Mobile",
        state: "AL",
        zipCode: "36602",
        status: "AVAILABLE",
        moderationStatus: "APPROVED",
        churchId: churches[2].id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Women's Professional Clothing",
        description:
          "Business attire for women, sizes 8-12. Perfect for job interviews.",
        category: "Clothing",
        latitude: 30.6944,
        longitude: -88.0431,
        address: "456 Government Street",
        city: "Mobile",
        state: "AL",
        zipCode: "36602",
        status: "CLAIMED",
        moderationStatus: "APPROVED",
        claimerId: regularUsers[7].id,
        claimedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        churchId: churches[2].id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Toddler Toys and Games",
        description:
          "Collection of educational toys for ages 1-4. All pieces included.",
        category: "Baby & Kids",
        latitude: 30.6944,
        longitude: -88.0431,
        address: "456 Government Street",
        city: "Mobile",
        state: "AL",
        zipCode: "36602",
        status: "AVAILABLE",
        moderationStatus: "APPROVED",
        churchId: churches[2].id,
      },
    }),
  ]);

  items.push(...graceItems, ...baptistItems, ...hopeItems);

  console.log("📦 Created items");

  // 6. Create some verification requests
  const verificationRequests = await Promise.all([
    // Carlos requesting to join Hope Fellowship
    prisma.churchVerificationRequest.create({
      data: {
        userId: regularUsers[2].id, // Carlos
        churchId: churches[2].id, // Hope Fellowship
        requesterId: regularUsers[2].id,
        status: "PENDING",
        notes: "New to the area, would like to join the church community.",
      },
    }),

    // Nancy requesting to join First Baptist
    prisma.churchVerificationRequest.create({
      data: {
        userId: regularUsers[9].id, // Nancy
        churchId: churches[1].id, // First Baptist
        requesterId: regularUsers[9].id,
        status: "PENDING",
        notes:
          "Regular attendee for 6 months, ready to become official member.",
      },
    }),
  ]);

  console.log("✅ Created verification requests");

  // 7. Create some invite codes for users
  const inviteCodes = await Promise.all([
    prisma.inviteCode.create({
      data: {
        code: "GRACE2024",
        userId: regularUsers[0].id, // Dale
        scans: 3,
        lastScannedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.inviteCode.create({
      data: {
        code: "HOPE2024",
        userId: regularUsers[8].id, // Kevin
        scans: 1,
        lastScannedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.inviteCode.create({
      data: {
        code: "BAPTIST2024",
        userId: regularUsers[5].id, // Susan
        scans: 0,
      },
    }),
  ]);

  console.log("🎫 Created invite codes");

  // 8. Create invitation analytics
  const analytics = await Promise.all([
    prisma.invitationAnalytics.create({
      data: {
        userId: regularUsers[0].id, // Dale
        userInvitesSent: 5,
        userInvitesScanned: 3,
        userInvitesCompleted: 2,
        churchInvitesSent: 1,
      },
    }),
    prisma.invitationAnalytics.create({
      data: {
        userId: regularUsers[4].id, // Robert
        userInvitesSent: 3,
        userInvitesScanned: 2,
        userInvitesCompleted: 1,
        churchInvitesSent: 0,
      },
    }),
  ]);

  console.log("📊 Created invitation analytics");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Seed Summary:");
  console.log(`👤 Admin: john-admin@test.com (password: Test1234)`);
  console.log(`⛪ Church Leads: 5 users (3 approved churches, 2 pending)`);
  console.log(`👥 Regular Users: 12 users (varying profiles and statuses)`);
  console.log(`🏛️ Churches: 5 total (3 approved, 2 pending)`);
  console.log(`📦 Items: ${items.length} items across approved churches`);
  console.log(
    `✅ Verification Requests: ${verificationRequests.length} pending`
  );
  console.log(`🎫 Invite Codes: ${inviteCodes.length} active codes`);
  console.log("\n🌎 Geographic Coverage: Lake Charles, LA → Jacksonville, FL");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
