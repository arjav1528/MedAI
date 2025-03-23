'use client';

import { useState, useEffect } from 'react';

interface VoiceInputProps {
  onResult: (text: string) => void;
  onCancel: () => void;
}

export default function VoiceInput({ onResult, onCancel }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    let recognition: SpeechRecognition | null = null;

    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setPulseAnimation(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        setTranscript(finalTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
        setPulseAnimation(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setPulseAnimation(false);
      };

      recognition.start();
    } else {
      setError("Speech recognition is not supported in this browser.");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const handleConfirm = () => {
    onResult(transcript);
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-600 font-medium">{error}</span>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Microphone animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full ${pulseAnimation ? 'animate-ping' : ''} bg-blue-100 opacity-75`}></div>
              <div className={`relative w-20 h-20 flex items-center justify-center rounded-full ${isListening ? 'bg-blue-500' : 'bg-gray-200'} transition-colors duration-300`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Status and transcript */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isListening ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {isListening ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Listening...
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Paused
                  </>
                )}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">
                {transcript || (
                  <span className="text-gray-400 italic">
                    Speak now to record your message...
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between space-x-4 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!transcript.trim()}
              className="flex-1 inline-flex justify-center items-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Confirm
            </button>
          </div>
        </>
      )}
    </div>
  );
}

