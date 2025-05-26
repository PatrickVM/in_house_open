const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedItems() {
  try {
    // First, get some churches to associate items with
    const churches = await prisma.church.findMany({
      where: { applicationStatus: "APPROVED" },
      take: 3,
    });

    if (churches.length === 0) {
      console.log(
        "No approved churches found. Please run the main seed first."
      );
      return;
    }

    // Create test items with different moderation statuses
    const testItems = [
      {
        title: "Office Chairs (Set of 5)",
        description:
          "Slightly used office chairs, ergonomic design, black color. Good condition with minor wear on armrests.",
        category: "Furniture",
        latitude: 38.445,
        longitude: -122.72,
        address: "123 Main St",
        city: "Santa Rosa",
        state: "CA",
        zipCode: "95401",
        status: "AVAILABLE",
        moderationStatus: "APPROVED",
        churchId: churches[0].id,
      },
      {
        title: "Children's Books Collection",
        description:
          "Large box of assorted children's books, ages 3-10. Includes picture books, early readers, and chapter books.",
        category: "Books",
        latitude: 38.43,
        longitude: -122.7,
        address: "456 Oak Ave",
        city: "Rohnert Park",
        state: "CA",
        zipCode: "94928",
        status: "AVAILABLE",
        moderationStatus: "PENDING",
        churchId: churches[1] ? churches[1].id : churches[0].id,
      },
      {
        title: "Kitchen Appliances Bundle",
        description:
          "Microwave, toaster, and coffee maker. All in working condition. Perfect for a new household.",
        category: "Kitchen",
        latitude: 38.45,
        longitude: -122.73,
        address: "789 Pine St",
        city: "Santa Rosa",
        state: "CA",
        zipCode: "95401",
        status: "CLAIMED",
        moderationStatus: "APPROVED",
        churchId: churches[0].id,
      },
      {
        title: "Inappropriate Item Example",
        description:
          "This is an example of an item that would be rejected for violating community guidelines.",
        category: "Other",
        latitude: 38.44,
        longitude: -122.71,
        address: "321 Elm St",
        city: "Santa Rosa",
        state: "CA",
        zipCode: "95401",
        status: "AVAILABLE",
        moderationStatus: "REJECTED",
        moderationNotes:
          "Item violates community guidelines. Please review our posting policies.",
        churchId: churches[2] ? churches[2].id : churches[0].id,
      },
      {
        title: "Sports Equipment",
        description:
          "Basketball, soccer ball, and tennis rackets. Great for youth programs.",
        category: "Sports & Outdoor",
        latitude: 38.42,
        longitude: -122.69,
        address: "654 Maple Ave",
        city: "Petaluma",
        state: "CA",
        zipCode: "94952",
        status: "AVAILABLE",
        moderationStatus: "PENDING",
        churchId: churches[1] ? churches[1].id : churches[0].id,
      },
      {
        title: "Computer Monitor",
        description:
          "24-inch LED monitor, excellent condition. Includes power cable and HDMI cable.",
        category: "Electronics",
        latitude: 38.46,
        longitude: -122.74,
        address: "987 Cedar Ln",
        city: "Santa Rosa",
        state: "CA",
        zipCode: "95401",
        status: "COMPLETED",
        moderationStatus: "APPROVED",
        churchId: churches[0].id,
      },
    ];

    // Create items
    for (const itemData of testItems) {
      const existingItem = await prisma.item.findFirst({
        where: { title: itemData.title },
      });

      if (!existingItem) {
        await prisma.item.create({
          data: itemData,
        });
        console.log(`Created item: ${itemData.title}`);
      } else {
        console.log(`Item already exists: ${itemData.title}`);
      }
    }

    console.log("✅ Items seeding completed!");
  } catch (error) {
    console.error("Error seeding items:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedItems();
