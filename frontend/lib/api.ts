import axios from "axios";
import { Query } from "@/types";
import { UserRole } from "@/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const submitQuery = async (queryData: Query) => {
  try {
    const response = await api.post("/queries", queryData);
    return response.data;
  } catch (error) {
    console.error("Error details:", error);
    throw error;
  }
};

export const getQueries = async (userId: string, role: string) => {
  try {
    // Fix the endpoint construction based on role
    const endpoint =
      role === UserRole.PATIENT ? `/queries?patientId=${userId}` : "/queries";

    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching queries:", error);
    throw error;
  }
};

export const verifyQuery = async (
  queryId: string,
  clinicianId: string,
  clinicianName: string,
  approved: boolean,
  modifiedResponse?: string,
  reassignTo?: string
) => {
  try {
    const response = await api.put(`/queries/${queryId}/verify`, {
      clinicianId,
      clinicianName,
      approved,
      modifiedResponse,
      reassignTo,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying query:", error);
    throw error;
  }
};

export default api;
