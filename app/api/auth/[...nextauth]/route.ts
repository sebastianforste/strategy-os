/**
 * NextAuth Configuration
 * ----------------------
 * Phase 17 Team Collaboration: OAuth with Google and LinkedIn
 */

import NextAuth from "next-auth";
import { authOptions } from "../../../../utils/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
