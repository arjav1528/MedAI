"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Query } from "@/types";
import { verifyQuery } from "@/lib/api";
import toast from "react-hot-toast";

interface QueryResponseCardProps {
  query: Query;
  isClinicianView: boolean;
  onQueryUpdated: (updatedQuery: Query) => void;
}

export default function QueryResponseCard({
  query,
  isClinicianView,
  onQueryUpdated,
}: QueryResponseCardProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [modifiedResponse, setModifiedResponse] = useState(
    query.aiResponse || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (approve: boolean) => {
    if (!session?.user) return;

    setIsSubmitting(true);
    try {
      const updatedQuery = await verifyQuery(
        query.id,
        session.user.id,
        session.user.name || "Unknown Clinician",
        approve ? modifiedResponse : undefined
      );

      onQueryUpdated(updatedQuery);
      toast.success("Response has been verified successfully");
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
              <div key={key}>
                <h5 className="font-medium text-gray-900 capitalize">
                  {key.replace(/_/g, " ")}
                </h5>
                <p className="mt-1">{String(value)}</p>
              </div>
            ))}
          </div>
        );
      }

      // Fallback for string content within JSON
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: responseText.replace(/\n/g, "<br />"),
          }}
        />
      );
    } catch (e) {
      // If not valid JSON, render as plain text with line breaks
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: responseText.replace(/\n/g, "<br />"),
          }}
        />
      );
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {isClinicianView ? `Patient: ${query.patientName}` : "Your Query"}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Submitted on {new Date(query.createdAt).toLocaleString()}
            </p>
          </div>
          {query.clinicianVerified && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Verified by {query.clinicianName}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Symptoms</dt>
            <dd className="mt-1 text-sm text-gray-900">{query.symptoms}</dd>
          </div>

          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Duration</dt>
            <dd className="mt-1 text-sm text-gray-900">{query.duration}</dd>
          </div>

          {query.temperature && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Temperature</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {query.temperature}
              </dd>
            </div>
          )}

          {query.medicalHistory && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                Medical History
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {query.medicalHistory}
              </dd>
            </div>
          )}

          {query.additionalInfo && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                Additional Information
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {query.additionalInfo}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-500">
            AI Response
            {!query.clinicianVerified && (
              <span className="ml-2 text-xs text-amber-600 font-normal">
                (Not verified by clinician yet)
              </span>
            )}
          </h4>

          {isClinicianView && !query.clinicianVerified && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit Response
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              rows={6}
              value={modifiedResponse}
              onChange={(e) => setModifiedResponse(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setModifiedResponse(query.aiResponse || "");
                }}
                disabled={isSubmitting}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerify(true)}
                disabled={isSubmitting}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSubmitting ? "Verifying..." : "Verify & Update"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 text-sm text-gray-900 prose max-w-none">
            {query.aiResponse ? (
              renderStructuredResponse(query.aiResponse)
            ) : (
              <p className="text-gray-500 italic">Waiting for AI response...</p>
            )}
          </div>
        )}
      </div>

      {isClinicianView && !query.clinicianVerified && !isEditing && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => handleVerify(false)}
            disabled={isSubmitting}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Verify As Is
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isSubmitting}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit & Verify
          </button>
        </div>
      )}
    </div>
  );
}
