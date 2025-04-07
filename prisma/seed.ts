import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "patrick.v.murray@gmail.com" },
    update: {},
    create: {
      email: "patrick.v.murray@gmail.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      bio: "System administrator",
      churchName: "Admin Church",
      services: "Administration",
      role: "ADMIN",
    },
  });

  console.log({ admin });

  // Create some sample users
  const userPassword = await hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      email: "john@example.com",
      password: userPassword,
      firstName: "John",
      lastName: "Doe",
      bio: "I love helping my community",
      churchName: "First Community Church",
      churchWebsite: "https://example.com/church",
      services: "Carpentry, Home Repairs",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      email: "jane@example.com",
      password: userPassword,
      firstName: "Jane",
      lastName: "Smith",
      bio: "Passionate about teaching and mentoring",
      churchName: "Grace Fellowship",
      services: "Tutoring, Mentoring",
    },
  });

  console.log({ user1, user2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
