import "dotenv/config";
import { auth } from "@/lib/auth";

// Run with: npx tsx scripts/create-admin.ts

async function createSuperUser() {
  const email = process.env.ADMIN_EMAIL || "";
  const password = process.env.ADMIN_PASSWORD;
  const name = "Super Admin";

  try {
    const user = await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: "admin",
      },
    });

    console.log(`Superuser created: ${user.user.email}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to create superuser:", error);
    process.exit(1);
  }
}

createSuperUser();
