"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Layout from "@/components/Layout";
import QueryForm from "@/components/QueryForm";
import QueryList from "@/components/QueryList";
import SOSButton from "@/components/SOSButton";
import { UserRole } from "@/types";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session) {
    redirect("/auth/signin");
    return null;
  }

  if (session.user?.role === UserRole.CLINICIAN) {
    redirect("/clinician");
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Healthcare AI Assistant
        </h1>

        <div className="space-y-8">
          <QueryForm />

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Health Queries
            </h2>
            <QueryList />
          </div>
        </div>

        <SOSButton />
      </div>
    </Layout>
  );
}
