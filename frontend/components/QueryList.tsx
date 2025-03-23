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
      if (!session?.user?._id) return;

      try {
        setLoading(true);
        const data = await getQueries(session.user._id, session.user.role);
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
  }, [session]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (queries.length === 0) return <div>No queries found.</div>;

  return (
    <div>
      {queries.map((query) => (
        <QueryResponseCard key={query._id} query={query} />
      ))}
    </div>
  );
}
