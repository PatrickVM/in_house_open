import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./lib/db";

// Define the UserRole enum to match our database
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  CHURCH = "CHURCH",
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Type check credentials to ensure they are strings
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            return null;
          }

          // Compare the provided password with the stored hash
          const isPasswordValid = await compare(password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          // Check if account is disabled
          if (!user.isActive) {
            return {
              error: 'ACCOUNT_DISABLED',
              reason: user.disabledReason || 'CHURCH_MEMBERSHIP_REQUIRED',
              email: user.email
            } as any;
          }

          return {
            id: user.id,
            email: user.email,
            name:
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email,
            role: user.role as any,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions as any);

// Re-export auth helpers for use in client components
export const { signIn, signOut } = NextAuth(authOptions as any);
