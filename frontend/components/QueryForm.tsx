"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { submitQuery } from "@/lib/api";
import toast from "react-hot-toast";
import VoiceInput from "./VoiceInput";

interface QueryFormData {
  symptoms: string;
  duration: string;
  temperature: string;
  medicalHistory: string;
  additionalInfo: string;
}

export default function QueryForm() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<
    keyof QueryFormData | null
  >(null);

  // Form state
  const [formData, setFormData] = useState<QueryFormData>({
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
      // Combine all form fields into a single description string
      const patientDescription = `
Symptoms: ${formData.symptoms}
Duration: ${formData.duration}
${formData.temperature ? `Temperature: ${formData.temperature}` : ""}
${formData.medicalHistory ? `Medical History: ${formData.medicalHistory}` : ""}
${
  formData.additionalInfo
    ? `Additional Information: ${formData.additionalInfo}`
    : ""
}
      `.trim();

      // Submit using the existing Query type structure
      await submitQuery({
        patientId: session.user.id,
        patientName: session.user.name || "Anonymous",
        // Place combined description in symptoms field
        symptoms: patientDescription,
        // Provide minimal values for required fields
        duration: "See description",
        temperature: "",
        medicalHistory: "",
        additionalInfo: "",
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

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900">
        Submit a Health Query
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Provide details about your symptoms and health concerns to get
        AI-assisted advice.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="symptoms"
            className="block text-sm font-medium text-gray-700 justify-between items-center"
          >
            Current Symptoms <span className="text-gray-400">Required</span>
          </label>
          <div className="mt-1 relative">
            <textarea
              id="symptoms"
              name="symptoms"
              rows={3}
              value={formData.symptoms}
              onChange={handleChange}
              className={`block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.symptoms ? "border-red-300" : ""
              }`}
              placeholder="Describe your symptoms in detail"
            />
            <button
              type="button"
              onClick={() => setActiveVoiceField("symptoms")}
              className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {errors.symptoms && (
            <p className="mt-1 text-sm text-red-600">{errors.symptoms}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700 justify-between items-center"
          >
            Duration of Symptoms <span className="text-gray-400">Required</span>
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.duration ? "border-red-300" : ""
              }`}
              placeholder="e.g., 3 days, 1 week"
            />
            <button
              type="button"
              onClick={() => setActiveVoiceField("duration")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="temperature"
            className="block text-sm font-medium text-gray-700"
          >
            Body Temperature
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="temperature"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              className="block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., 98.6°F, 37°C"
            />
            <button
              type="button"
              onClick={() => setActiveVoiceField("temperature")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="medicalHistory"
            className="block text-sm font-medium text-gray-700"
          >
            Medical History
          </label>
          <div className="mt-1 relative">
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              rows={3}
              value={formData.medicalHistory}
              onChange={handleChange}
              className="block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Any relevant medical history"
            />
            <button
              type="button"
              onClick={() => setActiveVoiceField("medicalHistory")}
              className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="additionalInfo"
            className="block text-sm font-medium text-gray-700"
          >
            Additional Information
          </label>
          <div className="mt-1 relative">
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={3}
              value={formData.additionalInfo}
              onChange={handleChange}
              className="block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Any other relevant information"
            />
            <button
              type="button"
              onClick={() => setActiveVoiceField("additionalInfo")}
              className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Query"}
          </button>
        </div>
      </form>

      {activeVoiceField && (
        <VoiceInput
          onResult={handleVoiceInput}
          onCancel={() => setActiveVoiceField(null)}
        />
      )}
    </div>
  );
}
