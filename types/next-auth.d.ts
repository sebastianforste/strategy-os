/**
 * NextAuth Type Extensions
 * ------------------------
 * Extend the built-in session types to include custom properties.
 */

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      teamId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    teamId?: string;
  }
}
