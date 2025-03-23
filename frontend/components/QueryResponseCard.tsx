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
  const [modifiedResponse, setModifiedResponse] = useState(
    query.response || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (approve: boolean) => {
    if (!session?.user) return;
    setIsSubmitting(true);
    try {
      const updatedQuery = await verifyQuery(
        query._id as string,
        session.user._id,
        session.user.name || "Unknown Clinician",
        approve ? modifiedResponse : undefined
      );
      toast.success("Response has been verified successfully");
      // No need for onQueryUpdated as we'll refresh the page
    } catch (error) {
      console.error("Error verifying query:", error);
      toast.error("Failed to verify the response. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  // Function to parse and display structured AI response
  const renderStructuredResponse = (responseText: string) => {
    try {
      // Try to parse as JSON
      const jsonResponse = JSON.parse(responseText);
      // If it's a JSON object, render each key as a section
      if (typeof jsonResponse === "object" && jsonResponse !== null) {
        return (
          <div className="space-y-4">
            {Object.entries(jsonResponse).map(([key, value]) => (
              <div key={key} className="border-b pb-2">
                <h4 className="font-medium text-gray-700">{key}</h4>
                <p className="text-gray-600">{String(value)}</p>
              </div>
            ))}
          </div>
        );
      }
      return <p className="text-gray-600">{responseText}</p>;
    } catch (e) {
      console.error(e)
      // If not JSON, just render as text
      return <p className="text-gray-600">{responseText}</p>;
    }
  };

  const isClinicianView = session?.user?.role !== UserRole.PATIENT;
  const formattedDate = new Date(query.date).toLocaleString();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Medical Query</h3>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {query.approved ? "Verified" : "Pending"}
          </span>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Your Description
          </h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans">
              {query.query}
            </pre>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Submitted on {formattedDate}
          </p>
        </div>

        {query.response ? (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              AI Response
            </h4>
            <div className="bg-blue-50 p-4 rounded-md">
              {isEditing ? (
                <textarea
                  value={modifiedResponse}
                  onChange={(e) => setModifiedResponse(e.target.value)}
                  className="w-full h-40 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                renderStructuredResponse(query.response)
              )}
            </div>
          </div>
        ) : (
          <div className="mb-6 text-center py-6 bg-gray-50 rounded-md">
            <p className="text-gray-500">Waiting for AI response...</p>
          </div>
        )}

        {isClinicianView && query.response && !query.approved && (
          <div className="flex flex-col space-y-3 mt-4">
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleVerify(true)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save & Approve"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Response
                </button>
                <button
                  onClick={() => handleVerify(true)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVerify(false)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
