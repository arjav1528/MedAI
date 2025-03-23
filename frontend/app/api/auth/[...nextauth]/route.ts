import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import clientPromise, { connectToDatabase } from "@/lib/mongodb";
import { NextAuthOptions } from "next-auth";
import { UserRole } from "@/types";
import { Adapter } from "next-auth/adapters";
// Remove the import of authOptions since we're defining it locally

// List of clinician emails
const emails = {
  ANDROLOGIST: "arjav1528@gmail.com",
  CARDIOLOGIST: "priyanshutalwar@gmail.com",
  DERMATOLOGIST: "sohamdas.2702@gmail.com",
};

const whichRole = (email: string): UserRole => {
  for (const [key, value] of Object.entries(emails)) {
    if (value === email) {
      return key as UserRole;
    }
  }
  return UserRole.PATIENT;
};

// Define the options but don't export them
const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter, // This adapter handles user creation
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          displayName:
            profile.name || `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          pfpUrl: profile.picture,
          role: whichRole(profile.email),
          maxQueries: 10,
          patientQueries: [],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token._id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user._id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async signIn({ user, account }) {
      console.log("Sign in callback starting:", { user, account });
      try {
        // Make sure email exists
        if (!user.email) {
          console.error("User has no email");
          return false;
        }

        // Update user role if they're a clinician
        const role = whichRole(user.email);
        user.role = role;

        // Log role assignment
        console.log(`Assigning role to user: ${user.email} -> ${role}`);

        try {
          // Update the user in the database - no need to do this here as it's handled in createUser event
          // The adapter will take care of creating/updating the user
          console.log("User role assigned:", role);
        } catch (dbError) {
          console.error("Database update error:", dbError);
          // Continue with sign-in despite DB error
        }

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return true; // Change back to true to prevent routing to error page
      }
    },
  },
  events: {
    createUser: async ({ user }) => {
      try {
        console.log("New user created:", user);
        // Assign role based on email
        const role = whichRole(user.email || "");
        // Get database using the standard connection function
        const db = await connectToDatabase();

        // Update the user with all required fields from the User schema
        await db.collection("users").updateOne(
          { id: user.id },
          {
            $set: {
              displayName: user.name || user.email?.split("@")[0] || "User",
              email: user.email,
              pfpUrl: user.image || "",
              role,
              maxQueries: 10,
              patientQueries: [],
            },
            $unset: {
              name: "", // Remove the name field
              emailVerified: "", // Remove emailVerified if not in your schema
            },
          }
        );
        console.log(
          `User ${user.email} updated with schema fields and role: ${role}`
        );
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
  debug: process.env.NODE_ENV === "development",
};


// Only export the handler functions
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
