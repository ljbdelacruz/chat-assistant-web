'use client'

import { useState } from 'react'
import { WorkingVoiceButton } from './WorkingVoiceButton'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      // Option 1: Set the transcript in the input field for user to review
      setMessage(transcript.trim())
      
      // Option 2: Automatically send the transcript (uncomment the line below)
      // onSendMessage(transcript.trim())
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message or use voice input..."
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
      
      {/* Voice Input Section */}
      <div className="flex items-center justify-center">
        <WorkingVoiceButton 
          onTranscript={handleVoiceTranscript}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
