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
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    throw new Error(`Admin user with email ${adminEmail} not found. Please run create-admin script first.`);
  }

  console.log(`Using admin user: ${admin.email}`);

  // Clear existing data safely
  try {
    await prisma.transactionItem.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.subcategory.deleteMany({});
    await prisma.category.deleteMany({});
    console.log("Cleared existing data.");
  } catch (error) {
    console.log("No existing data to clear or tables don't exist yet.");
  }

  const categoriesData = [
    {
      name: "Tools",
      subcategories: ["Hand Tools", "Power Tools", "Pneumatic Tools", "Measuring Tools"],
    },
    {
      name: "Building Materials",
      subcategories: ["Lumber & Timber", "Cement & Aggregates", "Roofing", "Drywall/Insulation"],
    },
    {
      name: "Plumbing",
      subcategories: ["Pipes & Fittings", "Faucets & Taps", "Water Pumps", "Sanitaryware"],
    },
    {
      name: "Electrical Supplies",
      subcategories: ["Wiring & Cables", "Lighting & Bulbs", "Switches & Sockets", "Circuit Breakers/Fuses"],
    },
    {
      name: "Fasteners & Hardware",
      subcategories: ["Nails", "Screws", "Bolts & Nuts", "Hinges", "Door Locks/Padlocks"],
    },
    {
      name: "Paint & Sundries",
      subcategories: ["Interior/Exterior Paint", "Brushes & Rollers", "Sealants/Adhesives", "Sandpaper"],
    },
  ];

  console.log("Creating categories and subcategories...");
  for (const cat of categoriesData) {
    await prisma.category.create({
      data: {
        name: cat.name,
        subcategories: {
          create: cat.subcategories.map((sub) => ({ name: sub })),
        },
      },
    });
  }

  const allSubcategories = await prisma.subcategory.findMany({
    include: { category: true },
  });

  const hardwareTemplates = [
    { name: "Hammer", subcategory: "Hand Tools", category: "Tools", price: 250.00, costPrice: 200 },
    { name: "Screwdriver Set", subcategory: "Hand Tools", category: "Tools", price: 450.00, costPrice: 400 },
    { name: "Electric Drill", subcategory: "Power Tools", category: "Tools", price: 2500.00, costPrice: 2000 },
    { name: "PVC Pipe 1/2\"", subcategory: "Pipes & Fittings", category: "Plumbing", price: 150.00, costPrice: 100 },
    { name: "LED Bulb 9W", subcategory: "Lighting & Bulbs", category: "Electrical Supplies", price: 120.00, costPrice: 80 },
    { name: "Cement Bag 50kg", subcategory: "Cement & Aggregates", category: "Building Materials", price: 850.00, costPrice: 750 },
    { name: "Paint Brush 3\"", subcategory: "Brushes & Rollers", category: "Paint & Sundries", price: 75.00, costPrice: 45 },
    { name: "Wood Screws 1\"", subcategory: "Screws", category: "Fasteners & Hardware", price: 2.00, costPrice: 1.00 },
  ];

  console.log("Generating 100 items...");

  const itemsToCreate = [];
  for (let i = 1; i <= 100; i++) {
    const template = hardwareTemplates[(i - 1) % hardwareTemplates.length];
    const subcat = allSubcategories.find(
      (s) => s.name === template.subcategory && s.category.name === template.category
    );

    if (!subcat) continue;

    itemsToCreate.push({
      name: `${template.name} #${i}`,
      description: `High-quality ${template.name.toLowerCase()} for professional use. Item number ${i}.`,
      costPrice: template.costPrice,
      price: template.price,
      quantity: 100,
      lowStockThreshold: 10,
      categoryId: subcat.categoryId,
      subcategoryId: subcat.id,
      userId: admin.id,
    });
  }

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
