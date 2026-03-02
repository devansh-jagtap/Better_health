import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  appName: "My BetterAuth AI App",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies(), openAPI()],
  // allow your front‑end origin(s) to call the au0th API
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "https://betterhack.vercel.app"],
});
