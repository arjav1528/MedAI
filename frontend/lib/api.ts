// lib/api.ts (updated)
import axios from "axios";
import { Query } from "@/types";

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
    const endpoint =
      role === "patient" ? `/queries?patientId=${userId}` : "/queries";

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
  modifiedResponse?: string
) => {
  const response = await api.put(`/queries/${queryId}/verify`, {
    clinicianId,
    clinicianName,
    approved,
    modifiedResponse,
  });
  return response.data;
};



export default api;
