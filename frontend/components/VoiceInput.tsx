"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onCancel: () => void;
}

export default function VoiceInput({ onTranscript, onCancel }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice recognition is not supported in your browser.");
      onCancel();
      return;
    }

    // Set up speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";
    
    recognitionInstance.onstart = () => {
      setIsListening(true);
      toast.success("Voice recognition started. Speak now...");
    };
    
    recognitionInstance.onresult = (event: any) => {
      const current = event.resultIndex;
      const currentTranscript = event.results[current][0].transcript;
      setTranscript(currentTranscript);
    };
    
    recognitionInstance.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      toast.error(`Voice recognition error: ${event.error}`);
      setIsListening(false);
      onCancel();
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    setRecognition(recognitionInstance);
    
    // Start listening immediately
    try {
      recognitionInstance.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      toast.error("Failed to start voice recognition");
      onCancel();
    }
    
    // Clean up
    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [onCancel]);

  const handleSubmit = () => {
    if (transcript) {
      onTranscript(transcript);
    } else {
      toast.error("No speech detected");
    }
  };

  const handleStop = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // Handle any errors
      }
    }
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Voice Input</h3>
        
        <div className="mb-4 p-3 bg-gray-100 rounded-md min-h-[100px] max-h-[200px] overflow-y-auto">
          {transcript ? transcript : "Listening for your voice..."}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">{isListening ? 'Listening...' : 'Not listening'}</span>
          </div>
          
          <div className="space-x-2">
            <button 
              onClick={handleStop}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={!transcript}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

