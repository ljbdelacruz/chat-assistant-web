'use client'

import { useState } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'

interface WorkingVoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

export function WorkingVoiceButton({ onTranscript, disabled = false, className = '' }: WorkingVoiceButtonProps) {
  console.log('🚀 WorkingVoiceButton component loaded!')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRecordingComplete = async (audioBlob: Blob) => {
    console.log('🎤 Recording completed! Blob size:', audioBlob.size)
    setIsProcessing(true)

    try {
      // Convert Blob to File for API compatibility
      const audioFile = new File([audioBlob], 'recording.mp3', {
        type: 'audio/mp3',
        lastModified: Date.now(),
      })
      
      const formData = new FormData()
      formData.append('file', audioFile)

      console.log('📤 Sending to transcription API...')
      
      // Step 1: Send file to Next.js API route (avoids CORS)
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      console.log("response", response)
      if (response.status != 200) {
        throw new Error(`Transcription failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ API result:', result)

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.text && result.text.trim()) {
        console.log('🎉 Transcription completed:', result.text)
        onTranscript(result.text.trim())
      } else {
        throw new Error('No transcription text received')
      }

    } catch (error) {
      console.error('❌ Transcription error:', error)
      // You could show an error message to the user here
    } finally {
      setIsProcessing(false)
    }
  }

  const {
    isRecording,
    isSupported,
    error,
    duration,
    startRecording,
    stopRecording,
  } = useAudioRecorder({
    onRecordingComplete: handleRecordingComplete,
    maxDuration: 60000, // 60 seconds
  })

  console.log('🎙️ WorkingVoiceButton state:', { isRecording, isSupported, error, isProcessing })

  const handleClick = () => {
    console.log('🔘 Voice button clicked! State:', { isRecording, isSupported })
    if (isRecording) {
      console.log('⏹️ Stopping recording...')
      stopRecording()
    } else {
      console.log('▶️ Starting recording...')
      startRecording()
    }
  }

  if (!isSupported) {
    return (
      <div className={`text-gray-400 ${className}`}>
        🚫 Audio not supported
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`
        px-4 py-2 rounded-md transition-all duration-200 font-medium
        ${isRecording 
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
          : isProcessing
          ? 'bg-yellow-500 text-white cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isProcessing ? (
        <>⏳ Processing...</>
      ) : isRecording ? (
        <>⏹️ Stop ({Math.floor(duration / 1000)}s)</>
      ) : (
        <>🎤 Record</>
      )}
    </button>
  )
}
