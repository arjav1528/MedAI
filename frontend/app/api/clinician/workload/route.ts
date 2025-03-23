import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest } from 'next/server';
import { UserRole } from "@/types/index";


export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { clinicianId, maxQueries } = await request.json();
    
    if (!clinicianId || typeof maxQueries !== "number" || maxQueries < 1 || maxQueries > 20) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    // Verify user is updating their own settings or is admin
    if (session.user.id !== clinicianId && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { db } = await connectToDatabase();
    
    // Update clinician workload setting
    const result = await db.collection("users").updateOne(
      { userId: clinicianId },
      { 
        $set: { maxQueries: maxQueries },
        $setOnInsert: { 
          userId: clinicianId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Workload updated successfully" 
    });
  } catch (error) {
    console.error("Error updating clinician workload:", error);
    return NextResponse.json(
      { error: "Failed to update workload" },
      { status: 500 }
    );
  }

    // Connect to database
    
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicianId = searchParams.get("clinicianId");
    
    if (!clinicianId) {
      return NextResponse.json({ error: "Clinician ID is required" }, { status: 400 });
    }
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Verify user is requesting their own data or is admin
    if (session.user.id !== clinicianId && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { db } = await connectToDatabase();
    
    // Find clinician's workload setting
    const clinician = await db.collection("users").findOne({ userId: clinicianId });
    
    if (!clinician) {
      return NextResponse.json({ maxQueries: 5 }); // Default value if not found
    }
    
    return NextResponse.json({ maxQueries: clinician.maxQueries });
  }catch (error) {
    console.error("Error fetching clinician workload:", error);
    return NextResponse.json(
      { error: "Failed to fetch workload" },
      { status: 500 }
    );
  }
    
    
}

