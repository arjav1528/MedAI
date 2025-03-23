"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getQueries } from "@/lib/api";
import { Query, UserRole } from "@/types";
import QueryResponseCard from "./QueryResponseCard";

export default function QueryList() {
  const { data: session } = useSession();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueries = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const data = await getQueries(
          session.user.id,
          session.user.role as string
        );
        setQueries(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching queries:", err);
        setError("Failed to load your queries. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900">No Queries Yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          {session?.user?.role === UserRole.PATIENT
            ? "You haven't submitted any health queries yet."
            : "There are no queries assigned to you at the moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {queries.map((query) => (
        <QueryResponseCard
          key={query.id}
          query={query}
          isClinicianView={session?.user?.role === UserRole.CLINICIAN}
          onQueryUpdated={(updatedQuery) => {
            setQueries((prev) =>
              prev.map((q) => (q.id === updatedQuery.id ? updatedQuery : q))
            );
          }}
        />
      ))}
    </div>
  );
}
