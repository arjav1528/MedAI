"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Oleo_Script, Montserrat } from "next/font/google";

const oleo = Oleo_Script({
  weight: "400",
  display: "swap",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Enable animations after mount to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Use NextAuth's signIn function to initiate Google authentication
      const result = await signIn("google", {
        callbackUrl: "/", // Changed from "/dashboard" to "/" (homepage)
        redirect: true, // Whether to automatically redirect the user
      });

      console.log("Sign in result:", result?.status);

      // If signIn returns a result (won't happen with redirect: true)
      if (result?.error) {
        console.error("Authentication error:", result.error);
        // You could set an error state here to display to the user
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row ${montserrat.className}`}
    >
      {/* Left side - Illustration & Content */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-500 to-emerald-500 text-white p-12 flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {mounted && (
          <div className="relative z-10 max-w-md mx-auto text-center">
            <div>
              <h1 className={`${oleo.className} text-5xl font-bold mb-4`}>
                <span>Med</span>AI
              </h1>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">
                Your AI Health Assistant
              </h2>
            </div>

            <div className="space-y-4 text-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <span>HIPAA-compliant AI assistance</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <span>Clinician-verified responses</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span>24/7 personalized health advice</span>
              </div>
            </div>
          </div>
        )}

        {/* Static decorative elements replacing animated shapes */}
        <div className="absolute top-16 right-16 w-20 h-20 rounded-full bg-white/10"></div>
        <div className="absolute bottom-24 left-12 w-32 h-32 rounded-full bg-white/10"></div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-12">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="text-center md:hidden">
              <h1 className={`${oleo.className} text-4xl font-bold mb-5`}>
                <span className="text-blue-600">Med</span>
                <span className="text-emerald-500">AI</span>
              </h1>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome to MedAI
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to access AI-assisted healthcare advice with clinician
              verification
            </p>
          </div>

          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-gray-50 text-sm text-gray-500">
                Continue with
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-300 hover:cursor-pointer hover:scale-[1.01] overflow-hidden cursor-pointer"
            >
              {/* Add hover effect gradient overlay */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-emerald-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>

              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-500 group-hover:text-gray-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
              </span>
              <span className="ml-3 relative z-10">
                {isLoading ? "Signing in..." : "Sign in with Google"}
              </span>
            </button>

            <p className="mt-2 text-center text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
