'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
}

// Helper function to get supported language
function getSupportedLanguage(preferredLang?: string): string {
  const fallbackLanguages = [
    preferredLang,
    navigator.language,
    navigator.language.split('-')[0], // e.g., 'en' from 'en-US'
    'en-US',
    'en'
  ].filter(Boolean) as string[]

  // Return the first available language, defaulting to 'en-US'
  return fallbackLanguages[0] || 'en-US'
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const {
    continuous = false,
    interimResults = true,
    lang
  } = options

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
      
      const recognition = recognitionRef.current
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.lang = getSupportedLanguage(lang)

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        setTranscript(prev => prev + finalTranscript)
        setInterimTranscript(interimTranscript)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message)
        
        // Handle language-not-supported error by trying fallback languages
        if (event.error === 'language-not-supported') {
          setError('Language not supported. Trying English...')
          // Try with English as fallback
          recognition.lang = 'en-US'
          setTimeout(() => {
            if (!isListening) {
              try {
                recognition.start()
              } catch (err) {
                setError('Speech recognition not available')
                setIsListening(false)
              }
            }
          }, 100)
        } else {
          setError(`Speech recognition error: ${event.error}`)
          setIsListening(false)
        }
      }
    } else {
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [continuous, interimResults, lang])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setInterimTranscript('')
      setError(null)
      recognitionRef.current.start()
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  }
}
