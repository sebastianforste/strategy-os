
import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      role?: string;
      teamId?: string | null;
    } & DefaultSession["user"]
  }

  interface User {
    role?: string;
    teamId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid profile email https://www.googleapis.com/auth/stitch",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid profile email w_member_social",
        },
      },
      userinfo: {
        url: "https://api.linkedin.com/v2/me",
      },
      profile(profile, tokens) {
        return {
           id: profile.id,
           name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
           email: null, // LinkedIn v2 doesn't always return email in profile, requires email scope + separate call often, but provider handles it if scope is set
           image: null, 
        }
      }
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0",
      authorization: {
        params: {
          scope: "tweet.read tweet.write users.read offline.access",
        },
      },
    }),
  ],
  
  callbacks: {
    async session({ session, user, token }) {
      // Add user ID and role to session
      if (session.user) {
        session.user.id = user?.id || (token?.sub as string);
        session.user.role = user?.role;
        session.user.teamId = user?.teamId;
        // Pass access token if available in JWT (for database strategy, we might need a different approach but for now exposing via token)
        session.accessToken = (token as any)?.accessToken;
      }
      return session;
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async signIn({ user, account }) {
      // Log sign-in for audit
      if (user.email) {
        await prisma.auditLog.create({
          data: {
            action: "user_signed_in",
            actor: user.email,
            metadata: {
              provider: account?.provider,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
      return true;
    },
  },
  
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  session: {
    strategy: "jwt", // Changed to JWT to make token passing easier for now, consistent with other next-auth setups
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};
