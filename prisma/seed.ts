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

  const adminEmail = process.env.ADMIN_EMAIL || "";
  const adminId = "admin-id";
  const admin = await prisma.user.update({
  where: { email: adminEmail },
  data: { id: adminId },
});

  console.log(`Using admin user: ${admin.email}`);

  const hardwareTemplates = [
    { name: "Hammer", category: "Hand Tools", price: 250.00, costPrice: 200, },
    { name: "Screwdriver Set", category: "Hand Tools", price: 450.00, costPrice: 400, },
    { name: "Electric Drill", category: "Power Tools", price: 2500.00, costPrice: 2000, },
    { name: "Circular Saw", category: "Power Tools", price: 3500.00, costPrice: 3000, },
    { name: "Pliers", category: "Hand Tools", price: 180.00, costPrice: 150, },
    { name: "Adjustable Wrench", category: "Hand Tools", price: 320.00, costPrice: 270, },
    { name: "Spirit Level", category: "Measurement", price: 150.00, costPrice: 100, },
    { name: "Tape Measure (5m)", category: "Measurement", price: 120.00, costPrice: 70, },
    { name: "LED Flashlight", category: "Electrical", price: 200.00, costPrice: 150, },
    { name: "Plastic Bucket (10L)", category: "General", price: 85.00, costPrice: 35, },
    { name: "Paint Brush (2 inch)", category: "Painting", price: 45.00, costPrice: 25, },
    { name: "Sandpaper (Grit 120)", category: "Abrasives", price: 15.00, costPrice: 10, },
    { name: "Common Nails (1kg)", category: "Fasteners", price: 95.00, costPrice: 45, },
    { name: "Wood Screws (100pcs)", category: "Fasteners", price: 110.00, costPrice: 60, },
    { name: "Hex Bolts (M8)", category: "Fasteners", price: 5.00, costPrice: 2, },
    { name: "Steel Nut (M8)", category: "Fasteners", price: 2.50, costPrice: 1, },
    { name: "Flat Washer (M8)", category: "Fasteners", price: 1.50, costPrice: 0.50, },
    { name: "Nylon Zip Ties (100pcs)", category: "General", price: 65.00, costPrice: 35, },
    { name: "Duct Tape (Silver)", category: "General", price: 125.00, costPrice: 65, },
    { name: "Super Glue", category: "General", price: 35.00, costPrice: 15, },
  ];

  console.log("Generating 100 items...");

  const itemsToCreate = [];
  for (let i = 1; i <= 100; i++) {
    const template = hardwareTemplates[(i - 1) % hardwareTemplates.length];
    itemsToCreate.push({
      name: `${template.name} #${i}`,
      description: `High-quality ${template.name.toLowerCase()} for professional use. Item number ${i}.`,
      costPrice: template.costPrice,
      price: template.price,
      quantity: 100,
      lowStockThreshold: 10,
      category: template.category,
      userId: admin.id,
    });
  }

  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.item.deleteMany({});
  console.log("Cleared existing data.");

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
