import { DefaultSession } from "next-auth";

export enum UserRole {
  USER = "user",
  CLINICIAN = "clinician",
  ADMIN = "admin",
}

declare module "next-auth" {
  interface User {
    role: UserRole; // Changed from role?: UserRole to make it consistent
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  maxQueries?: number;
}

export interface Query {
  id: string;
  patientId: string;
  patientName: string;
  symptoms: string;
  duration: string;
  temperature?: string;
  medicalHistory?: string;
  additionalInfo?: string;
  aiResponse?: string;
  clinicianVerified: boolean;
  clinicianId?: string;
  clinicianName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

