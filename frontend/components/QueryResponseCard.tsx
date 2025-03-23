"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Query, UserRole } from "@/types";
import { verifyQuery } from "@/lib/api";
import toast from "react-hot-toast";

interface QueryResponseCardProps {
  query: Query;
}

export default function QueryResponseCard({ query }: QueryResponseCardProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [modifiedResponse, setModifiedResponse] = useState(query.response);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (approve: boolean) => {
    if (!session?.user) return;
    setIsSubmitting(true);
    try {
      await verifyQuery(
        query._id as string,
        session.user._id,
        session.user.name || "Unknown Clinician",
        approve,
        approve ? modifiedResponse : undefined
      );
      toast.success("Response has been verified successfully");
    } catch (error) {
      console.error("Error verifying query:", error);
      toast.error("Failed to verify the response. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const renderResponse = () => {
    if (query.responseStatus === "waiting") {
      return <div>Waiting for AI response...</div>;
    }
    try {
      const parsedResponse = JSON.parse(query.response);
      return (
        <div>
          {Object.entries(parsedResponse).map(([key, value]) => (
            <div key={key}>
              <strong>{key.replace(/_/g, " ")}:</strong> {value as string}
            </div>
          ))}
        </div>
      );
    } catch {
      return <div>{query.response}</div>;
    }
  };

  const isClinicianView = session?.user?.role !== UserRole.PATIENT;

  return (
    <div className="border p-4 mb-4 rounded">
      <h3 className="font-bold">{query.query}</h3>
      <p>Status: {query.responseStatus}</p>
      {renderResponse()}
      {isClinicianView &&
        query.responseStatus === "ready" &&
        !query.approved && (
          <div>
            {isEditing ? (
              <textarea
                value={modifiedResponse}
                onChange={(e) => setModifiedResponse(e.target.value)}
                className="w-full p-2 border rounded"
              />
            ) : null}
            <button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel Edit" : "Edit Response"}
            </button>
            <button onClick={() => handleVerify(true)} disabled={isSubmitting}>
              Approve
            </button>
            {/* Add reassign functionality here */}
          </div>
        )}
    </div>
  );
}
