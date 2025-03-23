"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Layout from "@/components/Layout";
import QueryForm from "@/components/QueryForm";
import QueryList from "@/components/QueryList";
import SOSButton from "@/components/SOSButton";
import { UserRole } from "@/types";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setIsLoaded(true);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-200 mb-4"></div>
          <div className="h-4 w-48 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
    return null;
  }

  // Check if the user is a clinician (any role other than PATIENT)
  if (session.user?.role !== UserRole.PATIENT) {
    redirect("/clinician");
    return null;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 relative bg-gradient-to-b from-white to-blue-50 rounded-2xl">
        {/* Hero section with animated sliding gradient */}
        <div
          className={`relative rounded-xl shadow-lg overflow-hidden p-6 mb-8 transition-all duration-700 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {/* The animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 background-animate"></div>

          {/* Content with proper contrast */}
          <div className="relative z-10 text-white">
            <h1 className="text-3xl font-bold mb-2 drop-shadow-sm">
              Hello, {session.user?.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-lg opacity-90 drop-shadow-sm">
              How can I assist with your health today?
            </p>
          </div>
        </div>

        {/* Query form section - with animation */}
        <div
          className={`transition-all duration-700 delay-200 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              Ask a Health Question
            </h2>
            <QueryForm />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Health Queries
              </h2>
              <QueryList />
            </div>
          </div>
        </div>

        <SOSButton />
      </div>
    </Layout>
  );
}
