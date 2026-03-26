"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { File, Image, Plus, Send, X } from "lucide-react"

type MessageComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const MessageComposer = ({
  value,
  onChange,
  onSend,
  placeholder = "Message SMAI...",
  className = "",
  disabled = false,
}: MessageComposerProps) => {
  const attachmentMenuRef = useRef<HTMLDetailsElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<
    { id: string; name: string; type: "file" | "image" }[]
  >([])

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = attachmentMenuRef.current
      if (!menu || !menu.open) return
      if (event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "file" | "image"
  ) => {
    const selected = Array.from(event.target.files ?? []).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      type,
    }))

    if (selected.length) {
      setAttachments((prev) => [...prev, ...selected])
    }

    event.target.value = ""
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id))
  }

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(event) => handleAttachmentChange(event, "file")}
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={(event) => handleAttachmentChange(event, "image")}
      />
      {attachments.length ? (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {attachments.map((attachment) => (
            <Badge key={attachment.id} variant="outline">
              {attachment.type === "image" ? (
                <Image className="h-3.5 w-3.5" />
              ) : (
                <File className="h-3.5 w-3.5" />
              )}
              {attachment.name}
              <button
                type="button"
                onClick={() => handleRemoveAttachment(attachment.id)}
                className="rounded-full p-0.5 transition hover:bg-muted"
                aria-label={`Remove ${attachment.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="flex w-full items-center gap-2 rounded-full border bg-background px-3 py-2 shadow-sm">
        <details ref={attachmentMenuRef} className="relative">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-muted text-foreground hover:bg-muted hover:text-foreground"
          >
            <summary className="list-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <Plus />
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
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="min-h-[36px] resize-none overflow-hidden border-0 bg-transparent px-2 py-1 shadow-none focus-visible:ring-0"
        />
        <Button
          onClick={onSend}
          disabled={disabled}
          size="icon"
          className="h-10 w-10 rounded-full"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
