"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ChatHeader } from "./chat/components/ChatHeader"
import { ChatSidebar } from "./chat/components/ChatSidebar"
import { EmptyStateCard } from "./chat/components/EmptyStateCard"
import { MessageComposer } from "./chat/components/MessageComposer"
import { MessageList } from "./chat/components/MessageList"
import { useChatState } from "./chat/hooks/useChatState"

export default function Page() {
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  const {
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
    sendMessage,
    newChat,
  } = useChatState()

  useEffect(() => {
    if (!activeChat?.messages.length) return
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat?.messages.length])

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId)
    setSidebarOpen(false)
  }

  const hasMessages = Boolean(activeChat?.messages.length)

  return (
    <div className="flex min-h-svh">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <aside className="hidden w-72 border-r bg-muted/30 md:flex">
          <ChatSidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onNewChat={newChat}
          />
        </aside>
        <main className="relative flex h-svh flex-1 flex-col overflow-hidden">
          <ChatHeader
            title={activeChat?.title ?? "Chat"}
            isEphemeralChat={isEphemeralChat}
            onToggleEphemeral={toggleEphemeralChat}
            sidebarTrigger={
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 left-6 z-30 -translate-y-1/2 rounded-full hover:bg-transparent active:bg-transparent md:hidden"
                aria-label="Open sidebar"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            }
          />

          <ScrollArea className="min-h-0 flex-1">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8 pb-28">
              {hasMessages ? (
                <MessageList messages={activeChat?.messages ?? []} />
              ) : (
                <EmptyStateCard
                  composer={
                    <MessageComposer
                      value={message}
                      onChange={setMessage}
                      onSend={sendMessage}
                      disabled={!message.trim()}
                    />
                  }
                />
              )}
              <div ref={scrollAnchorRef} />
            </div>
          </ScrollArea>

          {hasMessages ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0">
              <div className="mx-auto w-full max-w-4xl px-6 pb-6">
                <div className="pointer-events-auto rounded-3xl border bg-background/95 p-2 shadow-lg backdrop-blur">
                  <MessageComposer
                    value={message}
                    onChange={setMessage}
                    onSend={sendMessage}
                    disabled={!message.trim()}
                    className="bg-transparent shadow-none"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </main>
        <SheetContent side="left" className="w-72 p-0">
          <ChatSidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onNewChat={newChat}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
