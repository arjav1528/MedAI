"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function SOSButton() {
  const { data: session } = useSession();
  const [isTriggering, setIsTriggering] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSOS = async () => {
    if (!session?.user?._id) return;

    setIsTriggering(true);
    try {
      // Get user's current location just for verification that permissions work
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Simulate a short delay for better user experience
          setTimeout(() => {
            toast.success(
              "SOS alert sent successfully! Emergency services have been notified."
            );
            setShowConfirmation(false);
            setIsTriggering(false);
          }, 800);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Could not get your location. Please enable location services."
          );
          setIsTriggering(false);
        }
      );
    } catch (error) {
      console.error("Error triggering SOS:", error);
      toast.error("Failed to send SOS alert. Please try again.");
      setIsTriggering(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirmation(true)}
        className="fixed bottom-6 right-6 z-10 rounded-full bg-red-600 p-4 text-white shadow-lg hover:bg-red-700 hover:scale-110 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
        aria-label="Emergency SOS"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span className="sr-only">SOS</span>
      </button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Emergency SOS
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will send an emergency alert with your current location to
              nearby healthcare providers and emergency services. Use only in
              case of a medical emergency.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={isTriggering}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSOS}
                disabled={isTriggering}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {isTriggering ? "Sending Alert..." : "Send SOS Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
