import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb";
import { NextAuthOptions } from "next-auth";
import { UserRole } from "@/types";
import { Adapter } from "next-auth/adapters";

// List of clinician emails
const CLINICIAN_EMAILS = [
  "sohamdas.2702@gmail.com",
  "arjav1528@gmail.com",
  "doctor@healthcare.com",
];

export const authOptions: NextAuthOptions = {
  adapter: (() => {
    try {
      return MongoDBAdapter(clientPromise) as Adapter;
    } catch (error) {
      console.error("MongoDB Adapter Error:", error);
      throw error;
    }
  })(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture,
          role: CLINICIAN_EMAILS.includes(profile.email) 
            ? UserRole.CLINICIAN 
            : UserRole.USER,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // First time JWT callback is run, user object is available
      if (user) {
        token.id = user.id;
        token.role = user.role || UserRole.USER;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // Make sure email exists
        if (!user.email) {
          console.error("User has no email");
          return false;
        }
        
        // Update user role if they're a clinician
        if (CLINICIAN_EMAILS.includes(user.email)) {
          user.role = UserRole.CLINICIAN;
          
          // Update the user in the database
          const client = await clientPromise;
          const db = client.db();
          await db.collection('users').updateOne(
            { email: user.email },
            { $set: { role: UserRole.CLINICIAN } }
          );
        }
        
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return true; // Still allow sign in even if role update fails
      }
    },
  },
  events: {
    createUser: async ({ user }) => {
      try {
        console.log("New user created:", user);
        
        // Assign role based on email
        const role = CLINICIAN_EMAILS.includes(user.email)
          ? UserRole.CLINICIAN 
          : UserRole.USER;
          
        // Update the user in the database
        const client = await clientPromise;
        const db = client.db();
        await db.collection('users').updateOne(
          { email: user.email },
          { $set: { role } }
        );
        
        console.log(`User ${user.email} assigned role: ${role}`);
      } catch (error) {
        console.error("Error in createUser event:", error);
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
