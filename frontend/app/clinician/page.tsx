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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Clinician Portal
        </h1>

        <div className="space-y-8">
          <ClinicianWorkload />

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Patient Queries Awaiting Review
            </h2>
            <QueryList />
          </div>
        </div>
      </div>
    </Layout>
  );
}
