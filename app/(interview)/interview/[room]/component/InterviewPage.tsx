"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import HR from "./interview_hr";
import Candidate from "./interview_candidate";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ChatHistoryItem {
  senderID: string;
  message: string;
}

interface RoomInfo {
  _id: string;
  topic: string;
  jobID: string;
  room_code: string;
  allow_user_email: string[];
  chat_history: ChatHistoryItem[];
  isEnd: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  senderID: string | null;
  username: string;
  message: string;
  isSelf: boolean;
  isSystem?: boolean;
}

interface InterviewPageProps {
  room: string;
}

export default function InterviewPage({ room }: InterviewPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isHR, setIsHR] = useState<boolean | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [ending, setEnding] = useState(false);

  // โหลด room history เพื่อตัดสินว่าเป็น HR หรือ Candidate
  useEffect(() => {
    const GetRoom = async () => {
      try {
        if (!room) {
          router.replace("/login");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/room/history/${room}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await res.json();
        if (!data.isSuccess || !data.room) {
          throw new Error("Token invalid or room not found");
        }

        setIsHR(Boolean(data.isHR));
        setRoomInfo(data.room as RoomInfo);

        // preload chat history
        const history = (data.room.chat_history || []) as ChatHistoryItem[];
        setMessages(
          history.map((h, index) => ({
            id: `history-${index}`,
            senderID: h.senderID,
            username: h.senderID, // ตอนนี้ยังไม่มี username จาก backend → ใช้ senderID แทนชั่วคราว
            message: h.message,
            isSelf: false,
          }))
        );
      } catch (error) {
        console.error("Failed to load room history", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    GetRoom();
  }, [room, router]);

  // ต่อ socket หลังจากโหลด history สำเร็จ
  useEffect(() => {
    if (!roomInfo || isHR === null) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:8000";

    const socket = io(socketUrl, {
      path: "/ws/socket.io", // ถ้า backend คุณใช้ path อื่น ปรับตรงนี้
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ socket connected", socket.id);
      socket.emit("join_room", { room_code: roomInfo.room_code });
    });

    socket.on("recive_message", (payload: any) => {
      // payload: { senderID, username, message }
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-${Math.random()}`,
          senderID: payload.senderID ?? null,
          username: payload.username ?? "Unknown",
          message: payload.message ?? "",
          isSelf: false,
        },
      ]);
    });

    socket.on("system_message", (payload: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}-${Math.random()}`,
          senderID: null,
          username: "System",
          message: payload.message ?? "",
          isSelf: false,
          isSystem: true,
        },
      ]);
    });

    socket.on("room_closed", (payload: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `closed-${Date.now()}`,
          senderID: null,
          username: "System",
          message: `Room closed by ${payload?.by ?? "someone"}`,
          isSelf: false,
          isSystem: true,
        },
      ]);

      // เด้งออกไปหน้าอื่น ตามใจคุณเลย
      setTimeout(() => {
        if (isHR) {
          router.replace("/hr");
        } else {
          router.replace("/home");
        }
      }, 1500);
    });

    socket.on("room_already_closed", () => {
      setSocketError("This room has already been closed.");
    });

    socket.on("error", (payload: any) => {
      console.error("Socket error:", payload);
      setSocketError(payload?.detail ?? "Socket error");
    });

    socket.on("disconnect", () => {
      console.log("🔌 socket disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomInfo, isHR, router]);

  const handleSendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const socket = socketRef.current;
    if (!socket || !roomInfo) return;

    // ส่งขึ้น server
    socket.emit("send_message", {
      room_code: roomInfo.room_code,
      message: trimmed,
    });

    // เพิ่มลง local ทันที (เพราะ server ไม่ส่งกลับให้คนส่งเอง)
    setMessages((prev) => [
      ...prev,
      {
        id: `self-${Date.now()}-${Math.random()}`,
        senderID: null,
        username: "You",
        message: trimmed,
        isSelf: true,
      },
    ]);
  };

  const handleEndRoom = () => {
    if (!roomInfo || !socketRef.current) return;
    setEnding(true);
    socketRef.current.emit("end_room", { room_code: roomInfo.room_code });
  };

  if (loading || isHR === null || !roomInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Room code
          </p>
          <p className="font-mono text-sm">{roomInfo.room_code}</p>
          <p className="text-sm text-muted-foreground">
            Topic: {roomInfo.topic}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {socketError && (
            <p className="text-xs text-destructive max-w-xs text-right">
              {socketError}
            </p>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndRoom}
            disabled={ending}
          >
            {ending && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
            End Interview
          </Button>
        </div>
      </header>

      {/* Main layout: แยกตาม role */}
      <main className="flex-1">
        {isHR ? (
          <HR
            room={room}
            roomInfo={roomInfo}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <Candidate
            room={room}
            roomInfo={roomInfo}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        )}
      </main>
    </div>
  );
}
