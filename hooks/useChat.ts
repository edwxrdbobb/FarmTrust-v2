"use client"

import { useState, useEffect } from "react"

export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Will fetch messages from Supabase
    setLoading(false)
  }, [conversationId])

  return {
    messages,
    loading,
    sendMessage: async (content: string) => {
      // Will be implemented
    },
  }
}
