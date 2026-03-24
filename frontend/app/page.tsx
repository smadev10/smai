"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Image,
  File,
  MessageSquareOff,
  Search,
} from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

type Chat = {
  id: string
  title: string
  messages: Message[]
}

const initialChats: Chat[] = [
  {
    id: "chat-1",
    title: "Product Strategy",
    messages: [
      {
        id: "m-1",
        role: "assistant",
        content:
          "Tell me about the goal and timeline, and I will draft a plan.",
        timestamp: "09:12",
      },
      {
        id: "m-2",
        role: "user",
        content: "We need a 6-week rollout plan for the new onboarding flow.",
        timestamp: "09:13",
      },
    ],
  },
  {
    id: "chat-2",
    title: "Support Playbook",
    messages: [
      {
        id: "m-3",
        role: "assistant",
        content:
          "Share the top support pain points and I will help categorize them.",
        timestamp: "11:02",
      },
    ],
  },
  {
    id: "chat-3",
    title: "Launch Checklist",
    messages: [],
  },
]

export default function Page() {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChatId, setActiveChatId] = useState(initialChats[0]?.id)
  const [message, setMessage] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEphemeralChat, setIsEphemeralChat] = useState(false)
  const attachmentMenuRef = useRef<HTMLDetailsElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0],
    [activeChatId, chats]
  )

  useEffect(() => {
    if (!activeChat?.messages.length) return
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat?.messages.length])

  const handleSendMessage = () => {
    if (!message.trim() || !activeChat) return

    const nextMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id
          ? { ...chat, messages: [...chat.messages, nextMessage] }
          : chat
      )
    )
    setMessage("")

    setTimeout(() => {
      const reply: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content:
          "Got it. I can summarize next steps or draft a plan if you want.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? { ...chat, messages: [...chat.messages, reply] }
            : chat
        )
      )
    }, 600)
  }

  const handleNewChat = () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: `New chat ${chats.length + 1}`,
      messages: [],
    }
    setChats((prev) => [newChat, ...prev])
    setActiveChatId(newChat.id)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const closeAttachmentMenu = () => {
    if (attachmentMenuRef.current) {
      attachmentMenuRef.current.open = false
    }
  }

  const handleSelectFiles = () => {
    closeAttachmentMenu()
    fileInputRef.current?.click()
  }

  const handleSelectImages = () => {
    closeAttachmentMenu()
    imageInputRef.current?.click()
  }

  const messageComposer = ({ className = "" } = {}) => (
    <div className={`flex w-full items-center gap-2 rounded-full border bg-background px-3 py-2 shadow-sm ${className}`}>
      <input ref={fileInputRef} type="file" className="hidden" multiple />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
      />
      <details ref={attachmentMenuRef} className="relative">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <summary className="list-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attach
            </span>
          </summary>
        </Button>
        <div className="absolute bottom-full left-0 z-10 mb-2 w-44 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <button
            type="button"
            onClick={handleSelectFiles}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            <File className="h-4 w-4" />
            Upload file
          </button>
          <button
            type="button"
            onClick={handleSelectImages}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            <Image className="h-4 w-4" />
            Upload image
          </button>
        </div>
      </details>
      <Input
        placeholder="Message SMAI..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        className="h-9 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
      />
      <Button
        onClick={handleSendMessage}
        disabled={!message.trim()}
        size="icon"
        className="h-9 w-9 rounded-full"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )

  const sidebar = (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-semibold">SMAI Workspace</div>
          <div className="text-xs text-muted-foreground">Chats</div>
        </div>
      </div>
      <Button variant="ghost" className="w-full justify-start gap-2">
        <Search className="h-4 w-4" />
        Search
      </Button>
      <Button className="w-full justify-start gap-2" onClick={handleNewChat}>
        <Plus className="h-4 w-4" />
        New chat
      </Button>
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-2">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant={chat.id === activeChat?.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => {
                setActiveChatId(chat.id)
                setSidebarOpen(false)
              }}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="truncate">{chat.title}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <Separator />
      <div className="text-xs text-muted-foreground">Powered by SMAI</div>
    </div>
  )

  return (
    <div className="flex min-h-svh">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <aside className="hidden w-72 border-r bg-muted/30 md:flex">
          {sidebar}
        </aside>
        <main className="relative flex h-svh flex-1 flex-col overflow-hidden">
          <div className="relative flex items-center justify-center border-b px-6 py-4">
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-6 top-1/2 z-30 -translate-y-1/2 rounded-full border bg-background/80 shadow-sm backdrop-blur md:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <div className="space-y-1 text-center">
              <div className="text-lg font-semibold">
                {activeChat?.title ?? "Chat"}
              </div>
              <div className="text-sm text-muted-foreground">AI Assistant</div>
            </div>
          <Button
            variant={isEphemeralChat ? "secondary" : "ghost"}
            size="icon"
            className="absolute right-6 rounded-full"
            onClick={() => setIsEphemeralChat((prev) => !prev)}
            aria-pressed={isEphemeralChat}
            aria-label={
              isEphemeralChat
                ? "Chat not saved enabled"
                : "Chat not saved disabled"
            }
          >
            {isEphemeralChat ? (
              <MessageSquareOff className="h-4 w-4" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8 pb-28">
            {activeChat?.messages.length ? (
              activeChat.messages.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-start gap-3 ${
                    entry.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className="h-9 w-9 ring-1 ring-border">
                    <AvatarFallback
                      className={
                        entry.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : undefined
                      }
                    >
                      {entry.role === "user" ? "ME" : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex max-w-[72%] flex-col gap-1 ${
                      entry.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ring-1 ring-border/60 ${
                        entry.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-foreground"
                      }`}
                    >
                      {entry.content}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {entry.timestamp}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Card>
                <CardHeader className="items-center space-y-2 text-center">
                  <CardTitle className="text-xl font-semibold tracking-tight">
                    Start a new conversation
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Ask anything or pick a chat from the sidebar to continue.
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mx-auto flex w-full max-w-xl justify-center">
                    {messageComposer()}
                  </div>
                </CardContent>
              </Card>
            )}
            <div ref={scrollAnchorRef} />
          </div>
        </ScrollArea>

          {activeChat?.messages.length ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0">
              <div className="mx-auto w-full max-w-4xl px-6 pb-6">
                <div className="pointer-events-auto rounded-3xl border bg-background/95 p-2 shadow-lg backdrop-blur">
                  {messageComposer({ className: "bg-transparent shadow-none" })}
                </div>
              </div>
            </div>
          ) : null}
        </main>
        <SheetContent side="left" className="w-72 p-0">
          {sidebar}
        </SheetContent>
      </Sheet>
    </div>
  )
}
