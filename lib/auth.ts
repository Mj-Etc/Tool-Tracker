import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [admin()],
  user: {
    additionalFields: {
      role: {
        type: ["cashier", "admin"],
        required: true,
        defaultValue: "cashier",
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session
