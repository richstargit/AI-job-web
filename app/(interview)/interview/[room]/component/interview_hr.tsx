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

interface HRProps {
  room: string;
  roomInfo: RoomInfo;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export default function HR({ roomInfo, messages, onSendMessage }: HRProps) {
  return (
    <div className="h-full flex flex-col gap-4 p-4 md:flex-row">
      {/* ======= ซ้าย: Candidate Info + Suggested Questions ======= */}
      <div className="w-full md:w-1/2 flex flex-col gap-4 md:h-[calc(100vh-7rem)]">
        {/* บน: Candidate Info */}
        <Card className="flex flex-col md:flex-1">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-base">Candidate Information</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {/* มือถือ: ให้ ScrollArea สูงตามเนื้อหา
                จอใหญ่: ให้ ScrollArea เลื่อนในกรอบด้วย max-h */}
            <ScrollArea className="md:h-full md:pr-2">
              {/* TODO: ดึงข้อมูล candidate จาก API จริงมาแทนตัวอย่างนี้ */}
              <div className="space-y-2 text-sm text-foreground">
                <p className="font-medium">Example Candidate Name</p>
                <p className="text-muted-foreground text-xs">
                  (ข้อมูลจริง เช่น ชื่อ, email, summary, skills ฯลฯ)
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                  <li>Years of experience: 2 years</li>
                  <li>Main skills: React, Node.js, MongoDB</li>
                  <li>Last position: Junior Software Engineer</li>
                </ul>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* ล่าง: Suggested Questions */}
        <Card className="flex flex-col md:flex-1">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-base">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ScrollArea className="md:h-full md:pr-2">
              {/* TODO: ใช้ API จริงของ suggested questions */}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Q1: Technical</p>
                  <p className="text-muted-foreground">
                    Ask about their experience with microservices or
                    event-driven architecture.
                  </p>
                </div>
                <div>
                  <p className="font-medium">Q2: Problem Solving</p>
                  <p className="text-muted-foreground">
                    Have them walk through a real incident they handled and how
                    they resolved it.
                  </p>
                </div>
                <div>
                  <p className="font-medium">Q3: Collaboration</p>
                  <p className="text-muted-foreground">
                    How do they work with cross-functional teams under time
                    pressure?
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* ======= ขวา: Chat ======= */}
      <div className="w-full md:w-1/2 h-[70vh] md:h-[calc(100vh-7rem)]">
        {/* มือถือ: สูงตามเนื้อหา
            จอใหญ่: จำกัดความสูงให้เลื่อนในกรอบ */}
        <ChatPanel
          messages={messages}
          onSendMessage={onSendMessage}
          title="Interview Chat"
        />
      </div>
    </div>
  );
}
