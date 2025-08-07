'use client'

import { useState, useRef, useCallback } from 'react'

export interface UseAudioRecorderOptions {
  onRecordingComplete?: (audioBlob: Blob) => void
  maxDuration?: number // in milliseconds
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isSupported, setIsSupported] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { onRecordingComplete, maxDuration = 60000 } = options

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setDuration(0)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream

      // Check MediaRecorder support - prefer formats that work well with transcription
      let mimeType = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      } else {
        throw new Error('Audio recording not supported in this browser')
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        })
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob)
        }

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setError('Recording failed')
        setIsRecording(false)
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)

      // Start duration timer
      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        setDuration(elapsed)

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording()
        }
      }, 100)

    } catch (err) {
      console.error('Error starting recording:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.')
        } else {
          setError(err.message || 'Failed to start recording')
        }
      } else {
        setError('Failed to start recording')
      }
      setIsSupported(false)
    }
  }, [onRecordingComplete, maxDuration])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [isRecording])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    chunksRef.current = []
    setIsRecording(false)
    setDuration(0)
    setError(null)
  }, [])

  // Format duration for display
  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  return {
    isRecording,
    isProcessing,
    error,
    duration,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    formatDuration,
    setIsProcessing,
  }
}
