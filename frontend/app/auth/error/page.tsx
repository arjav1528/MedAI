'use client';

import { Suspense } from 'react';

// Component that uses useSearchParams (must be client component)
function ErrorContent() {
  // Only import and use useSearchParams within this component
  const { useSearchParams } = require('next/navigation');
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="mb-4 text-gray-700">
          {error === 'OAuthCallback' 
            ? 'There was a problem with the OAuth callback. Please try again.'
            : error === 'OAuthAccountNotLinked'
            ? 'This email is already associated with another account.'
            : 'An unexpected error occurred during authentication.'}
        </p>
        <p className="text-gray-700">Error code: {error || 'unknown'}</p>
        <a
          href="/auth/signin"
          className="mt-6 block rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  );
}

// Main page component that wraps client component with Suspense
export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <h1 className="mb-4 text-2xl font-bold">Loading...</h1>
          <p>Please wait while we process your request.</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
