import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Plus, Search } from "lucide-react"
import { Chat } from "../types"

type ChatSidebarProps = {
  chats: Chat[]
  activeChatId?: string
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
}

export const ChatSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) => (
  <div className="flex h-full flex-col gap-4 p-4">
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div>
        <div className="text-sm font-semibold">SMAI</div>
        <div className="text-xs text-muted-foreground">Chats</div>
      </div>
    </div>
    <Button variant="ghost" className="w-full justify-start gap-2">
      <Search className="h-4 w-4" />
      Search
    </Button>
    <Button className="w-full justify-start gap-2" onClick={onNewChat}>
      <Plus className="h-4 w-4" />
      New chat
    </Button>
    <ScrollArea className="flex-1">
      <div className="space-y-2 pr-2">
        {chats.map((chat) => (
          <Button
            key={chat.id}
            variant={chat.id === activeChatId ? "secondary" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => onSelectChat(chat.id)}
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
