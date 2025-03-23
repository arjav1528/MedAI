"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Layout from "@/components/Layout";
import QueryList from "@/components/QueryList";
import ClinicianWorkload from "@/components/ClinicianWorkload";
import { UserRole } from "@/types";

export default function ClinicianPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session) {
    redirect("/auth/signin");
    return null;
  }

  if (session.user?.role !== UserRole.CLINICIAN) {
    redirect("/");
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
            Clinician Portal
          </h1>

          <div className="space-y-10">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ClinicianWorkload />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Patient Queries Awaiting Review
              </h2>
              <QueryList />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
