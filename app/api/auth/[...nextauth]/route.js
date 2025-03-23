import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb"; // Make sure this path is correct

// Your auth providers setup...

export const authOptions = {
  providers: [
    // Your providers here...
  ],
  adapter: MongoDBAdapter(clientPromise),
  // other options...
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };