"use client";

import { useState, useEffect } from "react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onCancel: () => void;
}

// Define proper types for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionError) => void;
  onend: (event: Event) => void;
}

// Type for the SpeechRecognition constructor
type SpeechRecognitionConstructor = new () => SpeechRecognition;

const VoiceInput = ({ onTranscript, onCancel }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || 
                               (window as any).SpeechRecognition as SpeechRecognitionConstructor;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        
        setTranscript(currentTranscript);
      };
      
      recognitionInstance.onerror = (event: SpeechRecognitionError) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
      
      // Start listening immediately when component mounts
      recognitionInstance.start();
    } else {
      alert("Speech recognition is not supported in your browser.");
      onCancel();
    }
    
    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onCancel, recognition]);

  const handleStopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    if (transcript) {
      onTranscript(transcript);
    } else {
      onCancel();
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className={`w-16 h-16 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'} flex items-center justify-center mb-4`}>
        <span className="text-2xl">🎤</span>
      </div>
      
      <p className="text-center mb-4 text-base">
        {isListening ? "Listening..." : "Voice detection stopped"}
      </p>
      
      {transcript && (
        <div className="bg-gray-100 p-3 rounded-md w-full mb-4 max-h-32 overflow-y-auto">
          <p className="text-base">{transcript}</p>
        </div>
      )}
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={handleStopListening}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base"
        >
          {isListening ? "Stop & Use Text" : "Use Text"}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VoiceInput;

