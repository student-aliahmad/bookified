'use client'

import { useEffect, useRef } from 'react'
import { Mic } from 'lucide-react'
import { Messages } from '@/types'

interface TranscriptProps {
  messages: Messages[]
  currentMessage: string
  currentUserMessage: string
  currentMessageContent?: string
  currentUserMessageContent?: string
}

const Transcript = ({
  messages,
  currentMessage,
  currentUserMessage,
  currentMessageContent,
  currentUserMessageContent,
}: TranscriptProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentMessage, currentUserMessage, currentMessageContent, currentUserMessageContent])

  // Show empty state
  if (messages.length === 0 && !currentMessage && !currentUserMessage) {
    return (
      <div className="transcript-container">
        <div className="transcript-empty">
          <Mic className="size-12 text-[#212a3b] mb-4" />
          <h2 className="transcript-empty-text">No conversation yet</h2>
          <p className="transcript-empty-hint">
            Click the mic button above to start talking
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="transcript-container">
      <div className="transcript-messages" ref={messagesContainerRef}>
        {/* Render all completed messages */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`transcript-message ${
              msg.role === 'user'
                ? 'transcript-message-user'
                : 'transcript-message-assistant'
            }`}
          >
            <div
              className={`transcript-bubble ${
                msg.role === 'user'
                  ? 'transcript-bubble-user'
                  : 'transcript-bubble-assistant'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Show streaming user message if exists */}
        {(currentUserMessageContent ?? currentUserMessage) && (
          <div className="transcript-message transcript-message-user">
            <div className="transcript-bubble transcript-bubble-user">
              {currentUserMessageContent ?? currentUserMessage}
              <span className="transcript-cursor" />
            </div>
          </div>
        )}

        {/* Show streaming assistant message if exists */}
        {(currentMessageContent ?? currentMessage) && (
          <div className="transcript-message transcript-message-assistant">
            <div className="transcript-bubble transcript-bubble-assistant">
              {currentMessageContent ?? currentMessage}
              <span className="transcript-cursor" />
            </div>
          </div>
        )}

        {/* Invisible div for auto-scroll target */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default Transcript
