import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserRole } from "@/types/index";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { clinicianId, maxQueries } = await request.json();
    
    console.log("Received request with clinicianId:", clinicianId, "maxQueries:", maxQueries);
    
    if (!clinicianId || typeof maxQueries !== "number" || maxQueries < 1 || maxQueries > 20) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    
    // Get database connection
    const db = await connectToDatabase("medai");
    const usersCollection = db.collection("users");
    
    // Log the user ID types to debug
    console.log("Session user ID:", session.user._id, "Type:", typeof session.user._id);
    console.log("Request clinicianId:", clinicianId, "Type:", typeof clinicianId);
    
    // Try to find user with email (most reliable)
    let user = null;
    
    // If clinicianId looks like an email
    if (clinicianId.includes('@')) {
      user = await usersCollection.findOne({ email: clinicianId });
      console.log("Looked up by email, found:", !!user);
    }
    
    // If not found by email, try by id/userId
    if (!user) {
      user = await usersCollection.findOne({ userId: clinicianId });
      console.log("Looked up by userId, found:", !!user);
    }
    
    // Try with _id as string
    if (!user) {
      user = await usersCollection.findOne({ _id: clinicianId });
      console.log("Looked up by _id as string, found:", !!user);
    }
    
    // Try with ObjectId
    if (!user && ObjectId.isValid(clinicianId)) {
      user = await usersCollection.findOne({ _id: new ObjectId(clinicianId) });
      console.log("Looked up by ObjectId, found:", !!user);
    }
    
    // If still no user found, check if the user collection is empty
    if (!user) {
      const count = await usersCollection.countDocuments({});
      console.log("Total users in collection:", count);
      
      // Last resort - dump a sample of users to see their structure
      if (count > 0) {
        const sampleUsers = await usersCollection.find({}).limit(2).toArray();
        console.log("Sample user structure:", JSON.stringify(sampleUsers, null, 2));
      }
      
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // User found - update maxQueries
    const updateField = user._id ? "_id" : "userId";
    const updateValue = user._id instanceof ObjectId ? user._id : user._id || user.userId;
    
    console.log("Updating user with field:", updateField, "value:", updateValue);
    
    const updateResult = await usersCollection.updateOne(
      { [updateField]: updateValue },
      { $set: { maxQueries: maxQueries } }
    );
    
    console.log("Update result:", updateResult);
    
    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Workload updated successfully",
      user: { id: updateValue, maxQueries } 
    });
  } catch (error) {
    console.error("Error updating clinician workload:", error);
    return NextResponse.json(
      { error: "Failed to update workload", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}