"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getQueries } from "@/lib/api";
import { Query, UserRole } from "@/types";
import QueryResponseCard from "./QueryResponseCard";
import { useRouter } from "next/navigation";

export default function QueryList() {
  const { data: session } = useSession();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQueries = async () => {
      if (!session?.user?._id) return;

      try {
        setLoading(true);
        const data = await getQueries(
          session.user._id,
          session.user.role as string
        );

        console.log("Fetched queries:", data);
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

    // Set up polling for patients to check for updates
    let interval: NodeJS.Timeout | null = null;

    if (session?.user?.role === UserRole.PATIENT) {
      interval = setInterval(fetchQueries, 10000); // Poll every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, router]);

  const handleQueryUpdated = (updatedQuery: Query) => {
    setQueries((prevQueries) =>
      prevQueries.map((q) => (q._id === updatedQuery._id ? updatedQuery : q))
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 text-red-500 rounded-lg">
        <p>{error}</p>
        <button
          onClick={() => {
            router.refresh();
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">No Queries Yet</h3>
        <p className="text-gray-600">
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
          key={query._id}
          query={query}
          onQueryUpdated={handleQueryUpdated}
        />
      ))}
    </div>
  );
}
