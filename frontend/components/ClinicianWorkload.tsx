'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function ClinicianWorkload() {
  const { data: session } = useSession();
  const [maxQueries, setMaxQueries] = useState<number>(5);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateWorkload = async () => {
    if (!session?.user?.id) return;

    setIsUpdating(true);
    try {
      // API call to update clinician's workload preference
      await fetch("/api/clinician/workload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicianId: session.user.id,
          maxQueries,
        }),
      });

      toast.success("Workload preference updated successfully");
    } catch (error) {
      console.error("Error updating workload:", error);
      toast.error("Failed to update workload preference");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900">Workload Management</h2>
      <p className="mt-1 text-sm text-gray-500">
        Set your preferred maximum number of concurrent queries to handle.
      </p>

      <div className="mt-6">
        <label
          htmlFor="maxQueries"
          className="block text-sm font-medium text-gray-700"
        >
          Maximum Concurrent Queries
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            name="maxQueries"
            id="maxQueries"
            min="1"
            max="20"
            value={maxQueries}
            onChange={(e) => setMaxQueries(parseInt(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleUpdateWorkload}
          disabled={isUpdating}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Updating..." : "Update Preference"}
        </button>
      </div>
    </div>
  );
}

