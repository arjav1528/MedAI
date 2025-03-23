import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { Query, UserRole } from "@/types";
import { ObjectId } from "mongodb";
import axios from "axios";

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
      response: "",
      aiResponse: null,
      responseStatus: "waiting", // Initial status is waiting
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

    // Update the user's patientQueries array without using $push
    if (insertedQuery && ObjectId.isValid(queryData.patientId)) {
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

    // Send the query to the AI service asynchronously
    if (insertedQuery) {
      fetchAIResponse(insertedQuery._id, queryData.query, queriesCollection);
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

// Function to fetch AI response
async function fetchAIResponse(
  queryId: any,
  patientDescription: string,
  queriesCollection: any
) {
  try {
    // Call the AI service
    const response = await axios.post("https://medai-pkqz.onrender.com/chat", {
      patient_description: patientDescription,
    });

    // Update the query with the AI response
    await queriesCollection.updateOne(
      { _id: queryId },
      {
        $set: {
          aiResponse: response.data,
          response: JSON.stringify(response.data),
          responseStatus: "ready",
        },
      }
    );

    console.log(`Updated query ${queryId} with AI response`);
  } catch (error) {
    console.error(`Error fetching AI response for query ${queryId}:`, error);
    // Update the query to indicate an error
    await queriesCollection.updateOne(
      { _id: queryId },
      {
        $set: {
          responseStatus: "error",
          response: "Error fetching AI response",
        },
      }
    );
  }
}

// GET endpoint for fetching queries
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
        .sort({ date: -1 })
        .toArray();
    }
    // If user is a clinician and patientId is provided, return that patient's queries
    else if (patientId) {
      queries = await queriesCollection
        .find({ patientId })
        .sort({ date: -1 })
        .toArray();
    }
    // If user is a clinician and no patientId is provided, return unassigned queries
    // or queries assigned to this clinician
    else {
      const userRole = session.user.role;
      // Find queries that need this specialist or are unassigned
      queries = await queriesCollection
        .find({
          $or: [
            { clinicianId: session.user._id },
            {
              clinicianId: null,
              responseStatus: "ready",
              "aiResponse.needed_clinician": mapRoleToSpecialist(userRole),
            },
          ],
        })
        .sort({ date: -1 })
        .toArray();
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

// Helper function to map user role to specialist name
function mapRoleToSpecialist(role: string): string {
  const mapping: Record<string, string> = {
    [UserRole.ANDROLOGIST]: "Andrologist",
    [UserRole.CARDIOLOGIST]: "Cardiologist",
    [UserRole.DERMATOLOGIST]: "Dermatologist",
    [UserRole.GASTROENTEROLOGIST]: "Gastroenterologist",
    [UserRole.PULMONOLOGIST]: "Pulmonologist",
    [UserRole.NEPHROLOGIST]: "Nephrologist",
    [UserRole.HEPATOLOGIST]: "Hepatologist",
    [UserRole.RHEUMATOLOGIST]: "Rheumatologist",
    [UserRole.ENDOCRINOLOGIST]: "Endocrinologist",
    [UserRole.NEUROLOGIST]: "Neurologist",
    [UserRole.OPHTHALMOLOGIST]: "Ophthalmologist",
    [UserRole.OTOLARYNGOLOGIST]: "Otolaryngologist",
    [UserRole.UROLOGIST]: "Urologist",
    [UserRole.GENERAL_PRACTITIONER]: "General Practitioner (GP)",
    [UserRole.PEDIATRICIAN]: "Pediatrician",
  };

  return mapping[role] || "";
}
