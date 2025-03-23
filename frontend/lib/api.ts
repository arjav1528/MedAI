import axios from "axios";
import { Query } from "@/types";

const api = axios.create({
  baseURL: process.env.API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    // You can add token logic here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const submitQuery = async (
  queryData: Omit<
    Query,
    "id" | "createdAt" | "updatedAt" | "clinicianVerified" | "aiResponse"
  >
) => {
  const response = await api.post("/queries", queryData);
  return response.data;
};

export const getQueries = async (userId: string, role: string) => {
  const response = await api.get(
    `/queries?${role === "clinician" ? "" : `patientId=${userId}`}`
  );
  return response.data;
};

export const verifyQuery = async (
  queryId: string,
  clinicianId: string,
  clinicianName: string,
  modifiedResponse?: string
) => {
  const response = await api.put(`/queries/${queryId}/verify`, {
    clinicianId,
    clinicianName,
    modifiedResponse,
  });
  return response.data;
};

export const triggerSOS = async (
  userId: string,
  location: { lat: number; lng: number }
) => {
  const response = await api.post("/sos", { userId, location });
  return response.data;
};

export default api;
