import { Header } from '@/components/layout/Header'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Chat Assistant
            </h1>
            <p className="text-lg text-muted-foreground">
              Your intelligent conversation partner powered by AI
            </p>
          </div>
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}
