// app/api/queries/[id]/verify/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const queryId = params.id;
    if (!queryId || !ObjectId.isValid(queryId)) {
      return NextResponse.json({ error: "Invalid query ID" }, { status: 400 });
    }

    // Parse request body
    const {
      clinicianId,
      clinicianName,
      approved,
      modifiedResponse,
      reassignTo,
    } = await request.json();

    // Get database connection
    const db = await connectToDatabase();
    const queriesCollection = db.collection("queries");

    // Find the query
    const query = await queriesCollection.findOne({
      _id: new ObjectId(queryId),
    });

    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }

    // Update object
    const updateData: any = {
      clinicianId,
      responseStatus: approved ? "approved" : "ready",
    };

    // If reassigning to another clinician
    if (reassignTo) {
      updateData.clinicianId = reassignTo;
      updateData.responseStatus = "ready";
    } else if (approved) {
      // If approving with a modified response
      updateData.approved = true;
      if (modifiedResponse) {
        updateData.response = modifiedResponse;
      }
    }

    // Update the query
    const result = await queriesCollection.updateOne(
      { _id: new ObjectId(queryId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update query" },
        { status: 500 }
      );
    }

    // Get the updated query
    const updatedQuery = await queriesCollection.findOne({
      _id: new ObjectId(queryId),
    });

    return NextResponse.json({
      success: true,
      message: reassignTo
        ? "Query reassigned"
        : approved
        ? "Query response approved"
        : "Query response updated",
      query: updatedQuery,
    });
  } catch (error) {
    console.error("Error verifying query:", error);
    return NextResponse.json(
      {
        error: "Failed to verify query",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

