'use client'

import { useCallback } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { cn } from '@/lib/utils'

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceInputButton({ onTranscript, disabled, className }: VoiceInputButtonProps) {
  console.log('VoiceInputButton component loaded')
  
  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    console.log('handleRecordingComplete called with audioBlob:', audioBlob)
    setIsProcessing(true)
    
    try {
      // Send audio to transcription API
      const formData = new FormData()
      // Convert Blob to File object since your transcription service expects a proper file
      const audioFile = new File([audioBlob], 'recording.mp3', {
        type: 'audio/mp3',
        lastModified: Date.now(),
      })
      formData.append('file', audioFile)
      // Step 1: Send file directly to your transcription service
      const response = await fetch('http://localhost:8001/transcribe', {
        method: 'POST',
        body: formData,
      })
      console.log("Response from transcription API:");
      console.log(response);
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`)
      }
      
      const submitResult = await response.json()
      console.log('Submit result:', submitResult)
      
      if (submitResult.error) {
        throw new Error(submitResult.error)
      }
      
      const transcriptionId = submitResult.id
      if (!transcriptionId) {
        throw new Error('No transcription ID received')
      }
      
      console.log('Got transcription ID:', transcriptionId)
      
      // Step 2: Poll for completion
      let attempts = 0
      const maxAttempts = 30
      let delay = 1000
      
      while (attempts < maxAttempts) {
        console.log("polling attempts")
        await new Promise(resolve => setTimeout(resolve, delay))
        
        console.log(`Polling attempt ${attempts + 1}, checking status...`)
        const statusResponse = await fetch(
          `http://localhost:8001/transcribe/status/${transcriptionId}`,
          { method: 'GET' }
        )
        
        if (statusResponse.status != 200) {
          throw new Error(`Status check failed: ${statusResponse.status}`)
        }

        console.log("statusResponse", statusResponse)
        
        const statusResult = await statusResponse.json()
        console.log('Status result:', statusResult)
        
        if (statusResult.status === 'completed' && statusResult.transcription) {
          console.log('Transcription completed:', statusResult.transcription)
          onTranscript(statusResult.transcription.trim())
          return
        }
        
        if (statusResult.status === 'failed' || statusResult.error) {
          throw new Error(statusResult.error || 'Transcription failed')
        }
        
        attempts++
        delay = Math.min(delay * 1.2, 5000)
      }
      
      throw new Error('Transcription timeout')
      
    } catch (err) {
      console.error('Transcription error:', err)
      // You might want to show this error to the user
    } finally {
      setIsProcessing(false)
    }
  }, [onTranscript])

  const {
    isRecording,
    isProcessing,
    error,
    duration,
    isSupported,
    startRecording,
    stopRecording,
    formatDuration,
    setIsProcessing,
  } = useAudioRecorder({
    onRecordingComplete: handleRecordingComplete,
    maxDuration: 60000, // 60 seconds max
  })
  
  console.log('useAudioRecorder state:', { isRecording, isProcessing, error, isSupported })

  const handleClick = () => {
    console.log('Voice button clicked! Current state:', { isRecording, isSupported })
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
        Audio recording not supported
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={cn(
          'p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : isProcessing
            ? 'bg-yellow-500 text-white'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground',
          (disabled || isProcessing) && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={
          isRecording 
            ? 'Stop recording' 
            : isProcessing 
            ? 'Processing audio...' 
            : 'Start voice input'
        }
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
        ) : isRecording ? (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
              clipRule="evenodd"
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
      
      {/* Status indicator */}
      {isRecording && (
        <div className="text-xs text-center">
          <div className="text-red-500 font-medium">Recording...</div>
          <div className="text-muted-foreground mt-1">
            {formatDuration(duration)}
          </div>
        </div>
      )}
      
      {isProcessing && (
        <div className="text-xs text-center">
          <div className="text-yellow-600 font-medium">Processing...</div>
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
