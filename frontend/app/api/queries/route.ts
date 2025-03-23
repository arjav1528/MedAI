import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Query, UserRole } from "@/types";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const queryData = await request.json();

    // Validate required fields
    if (!queryData.patientId || !queryData.query) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get database connection
    const db = await connectToDatabase();
    const queriesCollection = db.collection("queries");
    const usersCollection = db.collection("users");

    // Create query object with default values for missing fields
    const newQuery = {
      patientId: queryData.patientId,
      clinicianId: queryData.clinicianId || null,
      label: queryData.label || null,
      query: queryData.query,
      response: queryData.response || "",
      approved: false,
      date: queryData.date || new Date().toISOString(),
    };

    // Insert the query to the database
    const result = await queriesCollection.insertOne(newQuery);

    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create query" },
        { status: 500 }
      );
    }

    // Get the newly inserted query with its ID
    const insertedQuery = await queriesCollection.findOne({
      _id: result.insertedId,
    });

    // Safely handle the case where insertedQuery might be null
    if (insertedQuery) {
      if (ObjectId.isValid(queryData.patientId)) {
        // First get the current user document
        const user = await usersCollection.findOne({
          _id: new ObjectId(queryData.patientId),
        });

        if (user) {
          // Create or update the patientQueries array
          const patientQueries = user.patientQueries || [];
          patientQueries.push(insertedQuery._id);

          // Update the user document with the new array
          await usersCollection.updateOne(
            { _id: new ObjectId(queryData.patientId) },
            { $set: { patientQueries: patientQueries } }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Query created successfully",
      query: insertedQuery || newQuery,
    });
  } catch (error) {
    console.error("Error creating query:", error);
    return NextResponse.json(
      {
        error: "Failed to create query",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    
    // Get database connection
    const db = await connectToDatabase();
    const queriesCollection = db.collection("queries");
    
    let queries;
    
    // If user is a patient, return only their queries
    if (session.user.role === UserRole.PATIENT) {
      queries = await queriesCollection
        .find({ patientId: session.user._id })
        .toArray();
    }
    // If user is a clinician and patientId is provided, return that patient's queries
    else if (patientId) {
      queries = await queriesCollection.find({ patientId }).toArray();
    }
    // If user is a clinician and no patientId is provided, return all queries
    else {
      queries = await queriesCollection.find({}).toArray();
    }

    return NextResponse.json(queries);
  } catch (error) {
    console.error("Error fetching queries:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch queries",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
