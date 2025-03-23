"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { submitQuery } from "@/lib/api";
import toast from "react-hot-toast";
import VoiceInput from "./VoiceInput";
import { 
  Playfair_Display, 
  Roboto, 
  Open_Sans,
  Roboto_Mono
} from "next/font/google";

// Font definitions
const playfair = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<
    keyof QueryFormData | null
  >(null);
  const [progress, setProgress] = useState(0);

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

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = ['symptoms', 'duration'];
    const optionalFields = ['temperature', 'medicalHistory', 'additionalInfo'];
    
    let score = 0;
    let total = 0;
    
    // Required fields count for 70% of progress
    requiredFields.forEach(field => {
      total += 35;
      if (formData[field as keyof QueryFormData]?.trim()) score += 35;
    });
    
    // Optional fields count for 30% of progress
    optionalFields.forEach(field => {
      total += 10;
      if (formData[field as keyof QueryFormData]?.trim()) score += 10;
    });
    
    setProgress(Math.round((score / total) * 100));
  }, [formData]);

  // Form validation and submission handlers remain unchanged
  // ...

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

  // Render microphone button
  const renderMicButton = (fieldName: keyof QueryFormData, position: string) => (
    <button
      type="button"
      onClick={() => setActiveVoiceField(fieldName)}
      className={`absolute ${position} flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-105`}
      aria-label={`Voice input for ${fieldName}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
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
  );

  return (
    <div className={`${openSans.className} bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg`}>
      {/* Form header with elegant styling */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-gray-100">
        <h2 className={`${playfair.className} text-xl font-semibold text-gray-800 flex items-center`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Health Consultation
        </h2>
        <p className={`${roboto.className} mt-1 text-sm text-gray-600 font-light ml-9`}>
          Please provide detailed information about your symptoms
        </p>
        
        {/* Progress indicator */}
        <div className="mt-5 ml-9">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className={`${roboto.className} font-light`}>Form completion</span>
            <span className={`${roboto.className} font-medium`}>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-7 space-y-7">
        {/* Required Fields Section */}
        <div className="space-y-6">
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3 text-sm font-medium">1</div>
            <h3 className={`${playfair.className} text-md font-medium text-gray-800`}>
              Required Information
            </h3>
          </div>
          
          {/* Symptoms field */}
          <div className="ml-9">
            <label
              htmlFor="symptoms"
              className={`${roboto.className} block text-sm font-medium text-gray-700 mb-1.5`}
            >
              Current Symptoms <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <textarea
                id="symptoms"
                name="symptoms"
                rows={3}
                value={formData.symptoms}
                onChange={handleChange}
                className={`${openSans.className} block p-3.5 w-full rounded-lg border-2 group-hover:border-indigo-300 transition-colors duration-200 ${
                  errors.symptoms ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"
                } focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 sm:text-sm`}
                placeholder="Describe what you're experiencing in detail..."
              />
              {renderMicButton("symptoms", "right-3 bottom-3")}
            </div>
            {errors.symptoms && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.symptoms}
              </p>
            )}
          </div>

          {/* Duration field */}
          <div className="ml-9">
            <label
              htmlFor="duration"
              className={`${roboto.className} block text-sm font-medium text-gray-700 mb-1.5`}
            >
              Duration of Symptoms <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={`${openSans.className} block p-3.5 w-full rounded-lg border-2 group-hover:border-indigo-300 transition-colors duration-200 ${
                  errors.duration ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"
                } focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 sm:text-sm`}
                placeholder="e.g., 3 days, 1 week, since yesterday"
              />
              {renderMicButton("duration", "right-3 top-1/2 -translate-y-1/2")}
            </div>
            {errors.duration && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.duration}
              </p>
            )}
          </div>
        </div>
        
        {/* Optional Fields Section */}
        <div className="pt-7 border-t border-gray-100 space-y-6">
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mr-3 text-sm font-medium">2</div>
            <h3 className={`${playfair.className} text-md font-medium text-gray-800`}>
              Additional Details <span className="text-gray-400 font-normal">(Optional)</span>
            </h3>
          </div>
          
          {/* Temperature field */}
          <div className="ml-9">
            <label
              htmlFor="temperature"
              className={`${roboto.className} block text-sm font-medium text-gray-700 mb-1.5`}
            >
              Body Temperature
            </label>
            <div className="relative group">
              <input
                type="text"
                id="temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className={`${openSans.className} block p-3.5 w-full rounded-lg border-2 border-gray-200 focus:border-indigo-400 group-hover:border-indigo-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:text-sm`}
                placeholder="e.g., 98.6°F, 37°C, slightly elevated"
              />
              {renderMicButton("temperature", "right-3 top-1/2 -translate-y-1/2")}
            </div>
          </div>

          {/* Two-column layout for desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-9">
            {/* Medical History field */}
            <div>
              <label
                htmlFor="medicalHistory"
                className={`${roboto.className} block text-sm font-medium text-gray-700 mb-1.5`}
              >
                Medical History
              </label>
              <div className="relative group">
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  rows={3}
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  className={`${openSans.className} block p-3.5 w-full rounded-lg border-2 border-gray-200 focus:border-indigo-400 group-hover:border-indigo-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:text-sm`}
                  placeholder="Any existing conditions or past health issues"
                />
                {renderMicButton("medicalHistory", "right-3 bottom-3")}
              </div>
            </div>

            {/* Additional Info field */}
            <div>
              <label
                htmlFor="additionalInfo"
                className={`${roboto.className} block text-sm font-medium text-gray-700 mb-1.5`}
              >
                Additional Information
              </label>
              <div className="relative group">
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={3}
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  className={`${openSans.className} block p-3.5 w-full rounded-lg border-2 border-gray-200 focus:border-indigo-400 group-hover:border-indigo-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:text-sm`}
                  placeholder="Medications, allergies, or other relevant details"
                />
                {renderMicButton("additionalInfo", "right-3 bottom-3")}
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${roboto.className} inline-flex items-center justify-center rounded-md px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium shadow-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 disabled:opacity-70 transition-all duration-200 transform hover:translate-y-[-2px] disabled:hover:translate-y-0 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? "Submitting..." : "Submit Query"}
          </button>
        </div>
      </form>
      
      {/* Voice input component */}
      {activeVoiceField && (
        <VoiceInput onText={handleVoiceInput} onCancel={() => setActiveVoiceField(null)} />
      )}
    </div>
  );
}
