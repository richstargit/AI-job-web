"use client";

import { ChatPanel } from "./ChatPanel";
import type { ChatMessage } from "./InterviewPage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoomInfo {
  _id: string;
  topic: string;
  jobID: string;
  room_code: string;
  allow_user_email: string[];
  chat_history: { senderID: string; message: string }[];
  isEnd: boolean;
  created_at: string;
}

interface CandidateProps {
  room: string;
  roomInfo: RoomInfo;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export default function Candidate({
  roomInfo,
  messages,
  onSendMessage,
}: CandidateProps) {
  return (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      {/* ซ้าย: Job Info */}
      <div className="w-full md:w-1/2 h-[70vh] md:h-[calc(100vh-7rem)]">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-base">Job Information</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-3">
            <ScrollArea className="h-full">
              {/* TODO: เรียก API ด้วย roomInfo.jobID เพื่อโหลดรายละเอียดงานจริง */}
              <div className="space-y-2 text-sm text-foreground">
                <p className="font-medium">Job ID: {roomInfo.jobID}</p>
                <p className="text-muted-foreground text-xs">
                  ข้อมูลงานจริงจะมาแสดงตรงนี้
                </p>
                <p className="mt-2">
                  Example: Back-End Engineer at SCB Tech X. You will work with
                  Go / Java Spring Boot, microservices, and cloud-native infra.
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* ขวา: Chat */}
      <div className="w-full md:w-1/2 h-[70vh] md:h-[calc(100vh-7rem)]">
        <ChatPanel
          messages={messages}
          onSendMessage={onSendMessage}
          title="Chat with HR"
        />
      </div>
    </div>
  );
}
