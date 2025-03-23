"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { submitQuery } from "@/lib/api";
import toast from "react-hot-toast";
import VoiceInput from "./VoiceInput";
import { useRouter } from "next/navigation";
import {
  Roboto,
  Open_Sans,
  Roboto_Mono,
} from "next/font/google";

// Font definitions
const playfair = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

interface QueryFormData {
  symptoms: string;
  duration: string;
  temperature: string;
  medicalHistory: string;
  additionalInfo: string;
}

export default function QueryForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<
    keyof QueryFormData | null
  >(null);
  const [progress, setProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    symptoms: "",
    duration: "",
    temperature: "",
    medicalHistory: "",
    additionalInfo: "",
  });

  // Form errors
  const [errors, setErrors] = useState<
    Partial<Record<keyof QueryFormData, string>>
  >({});

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = ["symptoms", "duration"];
    const optionalFields = ["temperature", "medicalHistory", "additionalInfo"];
    let score = 0;
    let total = 0;

    // Required fields count for 70% of progress
    requiredFields.forEach((field) => {
      total += 35;
      if (formData[field as keyof QueryFormData]?.trim()) score += 35;
    });

    // Optional fields count for 30% of progress
    optionalFields.forEach((field) => {
      total += 10;
      if (formData[field as keyof QueryFormData]?.trim()) score += 10;
    });

    setProgress(Math.round((score / total) * 100));
  }, [formData]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof QueryFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof QueryFormData, string>> = {};

    if (!formData.symptoms.trim()) {
      newErrors.symptoms = "Symptoms are required";
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !session?.user) return;

    setIsSubmitting(true);
    try {
      // Concatenate all form fields into a single comprehensive description
      const patientDescription = `
        Symptoms: ${formData.symptoms.trim()}
        Duration: ${formData.duration.trim()}
        ${
          formData.temperature.trim()
            ? `Temperature: ${formData.temperature.trim()}`
            : ""
        }
        ${
          formData.medicalHistory.trim()
            ? `Medical History: ${formData.medicalHistory.trim()}`
            : ""
        }
        ${
          formData.additionalInfo.trim()
            ? `Additional Information: ${formData.additionalInfo.trim()}`
            : ""
        }
      `.trim();

      // Submit the query with all required properties
      await submitQuery({
        patientId: session.user._id,
        query: patientDescription,
        response: "",
        approved: false,
        date: new Date().toISOString(),
      });

      toast.success("Your query has been submitted successfully!");

      // Reset form
      setFormData({
        symptoms: "",
        duration: "",
        temperature: "",
        medicalHistory: "",
        additionalInfo: "",
      });

      // Force refresh to update the query list
      router.refresh();

      // Alternative: force a hard refresh of the page
      // window.location.reload();
    } catch (error) {
      console.error("Error submitting query:", error);
      toast.error("Failed to submit your query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle voice input
  const handleVoiceInput = (text: string) => {
    if (activeVoiceField) {
      setFormData((prev) => ({
        ...prev,
        [activeVoiceField]: text,
      }));
      setActiveVoiceField(null);
    }
  };

  // Render microphone button with improved functionality
  const renderMicButton = (
    fieldName: keyof QueryFormData,
    position: string
  ) => (
    <button
      type="button"
      onClick={() => setActiveVoiceField(fieldName)}
      className={`absolute ${position} flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-105 z-10 ${
        activeVoiceField === fieldName ? "bg-red-100 text-red-600 animate-pulse" : ""
      }`}
      aria-label={`Voice input for ${fieldName}`}
    >
      {activeVoiceField === fieldName ? "🔴" : "🎤"}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {/* Form header with elegant styling */}
      <h2 className={`${playfair.className} text-2xl font-bold text-gray-800`}>
        Health Consultation
      </h2>
      <p className={`${roboto.className} text-gray-600`}>
        Please provide detailed information about your symptoms
      </p>

      {/* Progress indicator */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
        <p className={`${roboto.className} text-sm text-gray-500 mt-1`}>
          Form completion: {progress}%
        </p>
      </div>

      {/* Required Fields Section */}
      <div className="space-y-4">
        <h3
          className={`${playfair.className} text-xl font-semibold text-gray-700`}
        >
          1. Required Information
        </h3>

        {/* Symptoms field */}
        <div className="relative pb-2">
          <label
            htmlFor="symptoms"
            className={`${openSans.className} block text-sm font-medium text-gray-700 mb-1`}
          >
            Current Symptoms *
          </label>
          <div className="relative">
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-12"
              placeholder="Describe your symptoms in detail..."
            ></textarea>
            {renderMicButton("symptoms", "right-3 bottom-3")}
          </div>
          {errors.symptoms && (
            <p className="mt-1 text-sm text-red-600">{errors.symptoms}</p>
          )}
        </div>

        {/* Duration field */}
        <div className="relative pb-2">
          <label
            htmlFor="duration"
            className={`${openSans.className} block text-sm font-medium text-gray-700 mb-1`}
          >
            Duration of Symptoms *
          </label>
          <div className="relative">
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-12"
              placeholder="How long have you been experiencing these symptoms?"
            />
            {renderMicButton("duration", "right-3 top-1/2 -translate-y-1/2")}
          </div>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
          )}
        </div>
      </div>

      {/* Optional Fields Section */}
      <div className="space-y-4">
        <h3
          className={`${playfair.className} text-xl font-semibold text-gray-700`}
        >
          2. Additional Details{" "}
          <span className="text-gray-500 font-normal">(Optional)</span>
        </h3>

        {/* Temperature field */}
        <div className="relative pb-2">
          <label
            htmlFor="temperature"
            className={`${openSans.className} block text-sm font-medium text-gray-700 mb-1`}
          >
            Body Temperature
          </label>
          <div className="relative">
            <input
              type="text"
              id="temperature"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-12"
              placeholder="Your current body temperature (if known)"
            />
            {renderMicButton("temperature", "right-3 top-1/2 -translate-y-1/2")}
          </div>
        </div>

        {/* Two-column layout for desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Medical History field */}
          <div className="relative">
            <label
              htmlFor="medicalHistory"
              className={`${openSans.className} block text-sm font-medium text-gray-700 mb-1`}
            >
              Medical History
            </label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any relevant medical history..."
            ></textarea>
            {renderMicButton("medicalHistory", "right-3 bottom-3")}
          </div>

          {/* Additional Info field */}
          <div className="relative">
            <label
              htmlFor="additionalInfo"
              className={`${openSans.className} block text-sm font-medium text-gray-700 mb-1`}
            >
              Additional Information
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any other details you'd like to share..."
            ></textarea>
            {renderMicButton("additionalInfo", "right-3 bottom-3")}
          </div>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${roboto.className} w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
      >
        {isSubmitting ? "Submitting..." : "Submit Query"}
      </button>

      {/* Voice input component - with additional safety checks */}
      {activeVoiceField && handleVoiceInput && (
        <VoiceInput
          onTranscript={handleVoiceInput}
          onCancel={() => setActiveVoiceField(null)}
        />
      )}
    </form>
  );
}
