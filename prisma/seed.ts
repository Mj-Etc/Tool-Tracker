import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Create an Admin user if not exists
  const adminId = "admin-user-id";
  const admin = await prisma.user.upsert({
    where: { id: adminId },
    update: {},
    create: {
      id: adminId,
      name: "Store Admin",
      email: "admin@tooltrackr.com",
      role: "admin",
    },
  });

  console.log(`Using admin user: ${admin.email}`);

  // 2. Define hardware item names to rotate through
  const hardwareTemplates = [
    { name: "Hammer", category: "Hand Tools", price: 250.00 },
    { name: "Screwdriver Set", category: "Hand Tools", price: 450.00 },
    { name: "Electric Drill", category: "Power Tools", price: 2500.00 },
    { name: "Circular Saw", category: "Power Tools", price: 3500.00 },
    { name: "Pliers", category: "Hand Tools", price: 180.00 },
    { name: "Adjustable Wrench", category: "Hand Tools", price: 320.00 },
    { name: "Spirit Level", category: "Measurement", price: 150.00 },
    { name: "Tape Measure (5m)", category: "Measurement", price: 120.00 },
    { name: "LED Flashlight", category: "Electrical", price: 200.00 },
    { name: "Plastic Bucket (10L)", category: "General", price: 85.00 },
    { name: "Paint Brush (2 inch)", category: "Painting", price: 45.00 },
    { name: "Sandpaper (Grit 120)", category: "Abrasives", price: 15.00 },
    { name: "Common Nails (1kg)", category: "Fasteners", price: 95.00 },
    { name: "Wood Screws (100pcs)", category: "Fasteners", price: 110.00 },
    { name: "Hex Bolts (M8)", category: "Fasteners", price: 5.00 },
    { name: "Steel Nut (M8)", category: "Fasteners", price: 2.50 },
    { name: "Flat Washer (M8)", category: "Fasteners", price: 1.50 },
    { name: "Nylon Zip Ties (100pcs)", category: "General", price: 65.00 },
    { name: "Duct Tape (Silver)", category: "General", price: 125.00 },
    { name: "Super Glue", category: "General", price: 35.00 },
  ];

  console.log("Generating 100 items...");

  const itemsToCreate = [];
  for (let i = 1; i <= 100; i++) {
    const template = hardwareTemplates[(i - 1) % hardwareTemplates.length];
    itemsToCreate.push({
      name: `${template.name} #${i}`,
      description: `High-quality ${template.name.toLowerCase()} for professional use. Item number ${i}.`,
      price: template.price,
      quantity: 100,
      lowStockThreshold: 10,
      category: template.category,
      userId: admin.id,
    });
  }

  // Clear existing data to avoid duplicates/conflicts if re-running
  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.item.deleteMany({});
  console.log("Cleared existing data.");

  // Bulk create items
  const created = await prisma.item.createMany({
    data: itemsToCreate,
  });

  console.log(`Successfully seeded ${created.count} items.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log("Seeding complete.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
