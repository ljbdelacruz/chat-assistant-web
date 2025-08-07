import { NextRequest, NextResponse } from 'next/server'

// Custom AI service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    console.log('📤 Sending message to AI service:', message)

    // Send message to your custom AI service
    const aiResponse = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!aiResponse.ok) {
      console.error('AI service error:', aiResponse.status, aiResponse.statusText)
      throw new Error(`AI service failed: ${aiResponse.status}`)
    }

    const aiResult = await aiResponse.json()
    console.log('✅ AI service response received')

    if (!aiResult.response) {
      throw new Error('No response from AI service')
    }

    return NextResponse.json({
      text: aiResult.response,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
