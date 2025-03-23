import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { UserRole } from "@/types/index";
import { ObjectId } from "mongodb";
import { Adapter } from "next-auth/adapters";

const emails = {
  "ANDROLOGIST" : "arjav1528@gmail.com",
  "CARDIOLOGIST" : "priyanshutalwar@gmail.com",
  "DERMATOLOGIST" : "amanmansoorpatel12345@gmail.com",
  "PATIENT" : "f20231140@goa.bits-pilani.ac.in"
}

const whichRole = (email: string): UserRole => {
  for (const [key, value] of Object.entries(emails)) {
    if (value === email) {
      return key as UserRole;
    }
  }
  return UserRole.PATIENT;
}



export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
