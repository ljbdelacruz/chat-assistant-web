'use client'

import { useState } from 'react'

interface SimpleVoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function SimpleVoiceButton({ onTranscript, disabled }: SimpleVoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false)

  const handleClick = () => {
    if (isRecording) {
      setIsRecording(false)
      // Simulate transcription for testing
      onTranscript("Test transcription - voice button working!")
    } else {
      setIsRecording(true)
      // Auto-stop after 3 seconds for testing
      setTimeout(() => {
        setIsRecording(false)
        onTranscript("Test transcription completed!")
      }, 3000)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isRecording ? (
          <div className="w-5 h-5 bg-white rounded-sm"></div>
        ) : (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
      
      {isRecording && (
        <div className="text-xs text-center">
          <div className="text-red-500 font-medium">Recording...</div>
        </div>
      )}
    </div>
  )
}
