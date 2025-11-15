// app/(interview)/interview/[room]/ChatPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "./InterviewPage";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  title?: string;
}

export function ChatPanel({ messages, onSendMessage, title }: ChatPanelProps) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  // auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="h-full flex flex-col ">
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-base">
          {title ?? "Interview Chat"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-y-auto">
          <ScrollArea className="md:h-full px-5 py-3 space-y-2">
            {messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="text-xs text-muted-foreground text-center"
                  >
                    {msg.message}
                  </div>
                );
              }
              const isSent = msg.isSelf
              return (
                <div key={msg.id}
                    className={cn(
                        "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                        isSent ? "flex-row-reverse" : "flex-row"
                    )}
                    >
                    
                    <div className={cn("flex flex-col max-w-[70%]", isSent ? "items-end" : "items-start")}>
                        <span className="text-xs font-medium text-foreground mb-1 px-1">{msg.username}</span>
                        <div
                        className={cn(
                            "rounded-2xl px-4 py-2.5 shadow-sm",
                            isSent
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm border border-border"
                        )}
                        >
                        <p className="text-sm leading-relaxed break-words max-w-50 md:max-w-100 whitespace-pre-wrap overflow-wrap-anywhere">{msg.message}</p>
                        </div>
                    </div>
                    </div>
              );
            })}
            <div ref={bottomRef} />
          </ScrollArea>
      </CardContent>
      <CardFooter className="border-t px-3 py-2">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2"
        >
          <Input
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-sm flex-1"
          />
          <Button type="submit" size="sm">
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
