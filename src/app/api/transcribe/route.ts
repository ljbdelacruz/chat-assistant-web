import { NextRequest, NextResponse } from 'next/server'

// Custom transcription service configuration
const TRANSCRIPTION_SERVICE_URL = process.env.TRANSCRIPTION_SERVICE_URL || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('file') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Validate file size (max 25MB)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    // Convert audio to MP3 format for your transcription service
    // Your service expects MP3 files, so we'll send the audio as-is
    // (MediaRecorder can be configured to output different formats)
    
    try {
      // Step 1: Submit audio file to your transcription service
      const transcriptionFormData = new FormData()
      transcriptionFormData.append('file', audioFile)
      
      const submitResponse = await fetch(`${TRANSCRIPTION_SERVICE_URL}/transcribe`, {
        method: 'POST',
        body: transcriptionFormData,
      })

      if (!submitResponse.ok) {
        throw new Error(`Transcription submission failed: ${submitResponse.status}`)
      }

      const submitResult = await submitResponse.json()
      const transcriptionId = submitResult.id

      if (!transcriptionId) {
        throw new Error('No transcription ID received from service')
      }

      // Step 2: Poll for completion with exponential backoff
      let attempts = 0
      const maxAttempts = 30 // Max 30 attempts (about 2 minutes)
      let delay = 1000 // Start with 1 second delay

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay))
        
        const statusResponse = await fetch(
          `${TRANSCRIPTION_SERVICE_URL}/transcribe/status/${transcriptionId}`,
          { method: 'GET' }
        )

        if (!statusResponse.ok) {
          throw new Error(`Status check failed: ${statusResponse.status}`)
        }

        const statusResult = await statusResponse.json()
        
        if (statusResult.status === 'completed' && statusResult.transcription) {
          return NextResponse.json({
            text: statusResult.transcription.trim(),
            id: transcriptionId,
            service: 'custom-transcription',
            timestamp: new Date().toISOString(),
          })
        }
        
        if (statusResult.status === 'failed' || statusResult.error) {
          throw new Error(statusResult.error || 'Transcription failed')
        }
        
        // Still processing, increase delay for next attempt
        attempts++
        delay = Math.min(delay * 1.2, 5000) // Cap at 5 seconds
      }
      
      throw new Error('Transcription timeout - please try again with a shorter audio clip')
      
    } catch (transcriptionError) {
      console.error('Custom transcription error:', transcriptionError)
      
      // Return error response
      return NextResponse.json(
        { 
          error: transcriptionError instanceof Error 
            ? transcriptionError.message 
            : 'Transcription service unavailable'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Transcription API error:', error)
    return NextResponse.json(
      { error: 'Failed to process audio transcription' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
