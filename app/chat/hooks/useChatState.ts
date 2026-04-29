"use client"

import { useMemo, useState } from "react"
import { initialChats } from "../data"
import { Chat, Message } from "../types"

const createTimestamp = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

export const useChatState = () => {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChatId, setActiveChatId] = useState(initialChats[0]?.id)
  const [message, setMessage] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEphemeralChat, setIsEphemeralChat] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0],
    [activeChatId, chats]
  )

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return

    let currentChat = activeChat

    if (!currentChat) {
      currentChat = {
        id: `chat-${Date.now()}`,
        title: message.trim().slice(0, 30),
        messages: [],
      }
      setActiveChatId(currentChat.id)
      setChats((prev) => [currentChat!, ...prev])
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: message.trim(),
      timestamp: createTimestamp(),
    }

    const assistantId = `${Date.now() + 1}-assistant`
    const assistantPlaceholder: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: createTimestamp(),
    }

    const targetChatId = currentChat.id
    const historyForApi = currentChat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === targetChatId
          ? { ...chat, messages: [...chat.messages, userMessage, assistantPlaceholder] }
          : chat
      )
    )
    setMessage("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...historyForApi, { role: "user", content: userMessage.content }],
        }),
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6).trim()
          if (payload === "[DONE]") continue

          try {
            const { content, error } = JSON.parse(payload) as {
              content?: string
              error?: string
            }

            if (error) throw new Error(error)

            if (content) {
              setChats((prev) =>
                prev.map((chat) =>
                  chat.id === targetChatId
                    ? {
                        ...chat,
                        messages: chat.messages.map((m) =>
                          m.id === assistantId
                            ? { ...m, content: m.content + content }
                            : m
                        ),
                      }
                    : chat
                )
              )
            }
          } catch (parseError) {
            console.error("[stream]", parseError)
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === targetChatId
                  ? {
                      ...chat,
                      messages: chat.messages.map((m) =>
                        m.id === assistantId && m.content === ""
                          ? {
                              ...m,
                              content:
                                parseError instanceof Error
                                  ? parseError.message
                                  : "Something went wrong.",
                            }
                          : m
                      ),
                    }
                  : chat
              )
            )
            break
          }
        }
      }
    } catch (error) {
      console.error("[sendMessage]", error)
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === targetChatId
            ? {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content:
                          "Could not reach the backend. Make sure both the backend and Ollama are running.",
                      }
                    : m
                ),
              }
            : chat
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const newChat = () => {
    const newChatItem: Chat = {
      id: `chat-${Date.now()}`,
      title: `New chat ${chats.length + 1}`,
      messages: [],
    }
    setChats((prev) => [newChatItem, ...prev])
    setActiveChatId(newChatItem.id)
  }

  const toggleEphemeralChat = () => {
    setIsEphemeralChat((prev) => !prev)
  }

  return {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    message,
    setMessage,
    sidebarOpen,
    setSidebarOpen,
    isEphemeralChat,
    toggleEphemeralChat,
    isLoading,
    sendMessage,
    newChat,
  }
}
