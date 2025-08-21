import GoogleProvider from "next-auth/providers/google";
import MicrosoftProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the user ID to the token right after signin
      if (account && user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // Check if this is a new user
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // This is a new user - redirect to pricing page
          console.log("New user signed up:", user.email);
          // We'll handle the redirect in the pages callback
        }
      } catch (error) {
        console.error("Database error during sign in:", error);
        // If database is not set up, still allow sign in but redirect to pricing
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Check if this is a new user by looking for the callback URL
      if (url.startsWith(baseUrl + "/api/auth/callback")) {
        // Direct new users to pricing page
        return `${baseUrl}/pricing?newUser=true`;
      }
      // Allows relative callback URLs
      else if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      try {
        if (isNewUser && user.email) {
          // Create usage tracking for new users with zero limits (they need to subscribe)
          await prisma.subscriptionUsage.upsert({
            where: { userId: user.id },
            update: {},
            create: {
              userId: user.id,
              resumeReviewsLimit: 0, // No access until subscribed
              followUpQuestionsLimit: 0, // No access until subscribed
              voiceNotesLimit: 0, // No access until subscribed
              liveMocksLimit: 0, // No access until subscribed
              usageResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // First day of next month
            },
          });
        }
      } catch (error) {
        console.error("Error creating usage tracking:", error);
        // Don't fail the sign in if database operations fail
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
