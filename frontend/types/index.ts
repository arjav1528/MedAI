export enum UserRole {
  PATIENT = "patient",
  CLINICIAN = "clinician",
  ADMIN = "admin",
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
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