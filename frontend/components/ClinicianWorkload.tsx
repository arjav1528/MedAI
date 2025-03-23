'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function ClinicianWorkload() {
  const { data: session } = useSession();
  const [maxQueries, setMaxQueries] = useState<number>(5);
  const [savedValue, setSavedValue] = useState<number>(5);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setIsChanged(maxQueries !== savedValue);
  }, [maxQueries, savedValue]);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchCurrentWorkload = async () => {
        try {
          const response = await fetch(`/api/clinician/workload?clinicianId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.maxQueries) {
              setMaxQueries(data.maxQueries);
              setSavedValue(data.maxQueries);
            }
          }
        } catch (error) {
          console.error("Error fetching workload setting:", error);
        }
      };
      
      fetchCurrentWorkload();
    }
  }, [session]);

  const incrementQueries = () => {
    if (maxQueries < 20) setMaxQueries(prev => prev + 1);
  };

  const decrementQueries = () => {
    if (maxQueries > 1) setMaxQueries(prev => prev - 1);
  };

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

      setSavedValue(maxQueries);
      setIsChanged(false);
      toast.success("Workload preference updated successfully");
    } catch (error) {
      console.error("Error updating workload:", error);
      toast.error("Failed to update workload preference");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 border border-blue-100">
      <div className="flex items-center mb-3">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
            <path d="M6 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6ZM15.75 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-2.25ZM6 12.75a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3v-2.25a3 3 0 0 0-3-3H6ZM17.625 13.5a.75.75 0 0 0-1.5 0v2.625H13.5a.75.75 0 0 0 0 1.5h2.625v2.625a.75.75 0 0 0 1.5 0v-2.625h2.625a.75.75 0 0 0 0-1.5h-2.625V13.5Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Workload Management</h2>
      </div>
      
      <p className="mt-1 text-sm text-gray-600 mb-6">
        Set your preferred maximum number of concurrent patient queries to handle at once.
      </p>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <label
          htmlFor="maxQueries"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Maximum Concurrent Queries
        </label>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center">
            <button 
              onClick={decrementQueries}
              disabled={maxQueries <= 1}
              className="absolute left-2 text-gray-500 hover:text-blue-500 disabled:text-gray-300 disabled:hover:text-gray-300 focus:outline-none"
            >
              <ChevronDownIcon className="h-5 w-5" />
            </button>
            
            <input
              type="number"
              name="maxQueries"
              id="maxQueries"
              min="1"
              max="20"
              value={maxQueries}
              onChange={(e) => setMaxQueries(parseInt(e.target.value) || 1)}
              className="block w-24 text-center rounded-md border-gray-300 py-2 px-8 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-lg"
            />
            
            <button 
              onClick={incrementQueries}
              disabled={maxQueries >= 20}
              className="absolute right-2 text-gray-500 hover:text-blue-500 disabled:text-gray-300 disabled:hover:text-gray-300 focus:outline-none"
            >
              <ChevronUpIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(maxQueries / 20) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>1</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>
        </div>
        
        <p className="mt-3 text-sm text-gray-500">
          {maxQueries <= 5 ? "Light workload" : 
           maxQueries <= 12 ? "Moderate workload" : 
           "Heavy workload"}
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleUpdateWorkload}
          disabled={isUpdating || !isChanged}
          className={`
            inline-flex items-center justify-center rounded-md py-2 px-4 text-sm font-medium shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200
            ${isChanged 
              ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {isUpdating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </>
          ) : (
            "Save Preference"
          )}
        </button>
      </div>
    </div>
  );
}

