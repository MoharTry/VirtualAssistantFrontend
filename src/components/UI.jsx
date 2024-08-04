import React, { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { speech_to_text } from '../speechRecognition'; // Ensure this method returns the correct object
import "./UI.css";

export const UI = ({ hidden, ...props }) => {
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const [backgroundType, setBackgroundType] = useState('default');
  const [transcription, setTranscription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognizer, setRecognizer] = useState(null);
  const [isActivelyListening, setIsActivelyListening] = useState(false);

  useEffect(() => {
    // Initialize the recognizer with callbacks for results and errors
    const newRecognizer = speech_to_text(
      (finalTranscript, interimTranscript) => {
        setTranscription(finalTranscript + interimTranscript);
        setIsActivelyListening(!!interimTranscript);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        setIsActivelyListening(false);
      }
    );
    setRecognizer(newRecognizer);

    // Cleanup: stop the recognizer if component unmounts
    return () => {
      if (newRecognizer) {
        newRecognizer.stop();
      }
    };
  }, []);

  const sendMessage = () => {
    if (!loading && !message && transcription) {
      chat(transcription);
      setTranscription('');
    }
  };

  const toggleBackground = () => {
    const body = document.querySelector("body");
    if (backgroundType === 'default') {
      body.classList.add("greenScreen");
      setBackgroundType('greenScreen');
    } else if (backgroundType === 'greenScreen') {
      body.classList.remove("greenScreen");
      body.style.backgroundImage = 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)';
      setBackgroundType('gradient');
    } else {
      body.classList.remove("greenScreen");
      body.style.backgroundImage = '';
      setBackgroundType('default');
    }
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        document.body.style.backgroundImage = `url(${event.target.result})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        setBackgroundType('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognizer.stop();
      setIsActivelyListening(false);
    } else {
      recognizer.start();
    }
    setIsListening(!isListening);
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
              </svg>
            )}
          </button>
          <button
            onClick={toggleBackground}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </button>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleCustomUpload}
          />
          <button
            onClick={() => document.getElementById('imageInput').click()}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          {/* Uncomment if you need an input field for manual text entry
          <input
            type="text"
            ref={input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={loading ? "Waiting for response..." : "Type your message..."}
            className="w-full p-4 rounded-md bg-gray-200 dark:bg-gray-600"
            disabled={loading}
          /> */}
          <button
            disabled={loading || message || isListening}
            onClick={toggleListening}
            className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${isActivelyListening ? "animate-pulse" : ""} ${loading || message ? "cursor-not-allowed opacity-30" : ""}`}
          >
            {isListening ? "Stop Listening" : "Start Listening"}
          </button>
          <button
            disabled={loading || !transcription}
            onClick={sendMessage}
            className="bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
      {transcription && (
        <div className="mt-2 text-sm text-gray-500 pointer-events-auto max-w-screen-sm w-full mx-auto">
          Transcription: {transcription}
        </div>
      )}
    </>
  );
};