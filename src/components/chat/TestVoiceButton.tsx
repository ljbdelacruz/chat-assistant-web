'use client'

import { useState, useCallback } from 'react'

interface TestVoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function TestVoiceButton({ onTranscript, disabled }: TestVoiceButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = useCallback(async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create a test audio file (empty blob for now)
      const testBlob = new Blob(['test audio data'], { type: 'audio/mp3' })
      
      // Send to transcription API
      const formData = new FormData()
      formData.append('file', testBlob, 'test.mp3')
      
      console.log('Sending to transcription API...')
      
      const response = await fetch('/transcribe', {
        method: 'POST',
        body: formData,
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Transcription result:', result)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result.text && result.text.trim()) {
        onTranscript(result.text.trim())
      } else {
        onTranscript('Test transcription from your API!')
      }
      
    } catch (err) {
      console.error('Transcription error:', err)
      setError(err instanceof Error ? err.message : 'Transcription failed')
    } finally {
      setIsProcessing(false)
    }
  }, [onTranscript])

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          isProcessing
            ? 'bg-yellow-500 text-white'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        } ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isProcessing ? 'Processing...' : 'Test transcription API'}
      >
        {isProcessing ? (
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
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
      
      {isProcessing && (
        <div className="text-xs text-center">
          <div className="text-yellow-600 font-medium">Testing API...</div>
        </div>
      )}
      
      {error && (
        <div className="text-xs text-destructive text-center max-w-32">
          Error: {error}
        </div>
      )}
    </div>
  )
}
