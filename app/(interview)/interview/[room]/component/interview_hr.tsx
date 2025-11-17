// app/(interview)/interview/[room]/HR.tsx
"use client";

import { useEffect, useState } from "react";
import { ChatPanel } from "./ChatPanel";
import type { ChatMessage } from "./InterviewPage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SuggestedQuestionsPanel from "./SuggestedQuestions";
import CandidateInfoCard from "./CandidateCard";
import { ChevronDown, ChevronRight } from "lucide-react";

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

/* ---------- Candidate Info Types ตาม API ---------- */
interface CandidatePersonalInfo {
  fullName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  birthDate: string | null;
  currentSalary: number | null;
  expectedSalary: number | null;
}

interface CandidateExperience {
  id: number;
  role: string;
  level: string;
  company: string;
  startDate: { month: string; year: string };
  endDate: { month: string; year: string } | null;
  description: string;
  isCurrentRole: boolean;
}

interface CandidateEducation {
  id: number;
  degree: string;
  institution: string;
  faculty: string;
  major: string;
  startDate: { month: string; year: string };
  endDate: { month: string; year: string } | null;
  gpa: string;
  isCurrentlyStudying: boolean;
}

interface CandidateCertificate {
  id: number;
  name: string;
}

interface CandidateAchievement {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  link: string;
  startDate: { month: string; year: string };
  endDate: { month: string; year: string } | null;
}

interface CandidateInfo {
  _id: string;
  user_email: string;
  personalInfo: CandidatePersonalInfo;
  skills: string[];
  experiences: CandidateExperience[];
  education: CandidateEducation[];
  certificates: CandidateCertificate[];
  achievement: CandidateAchievement[];
  skill_Graph: string[];
  skill_Maybe: string[];
}

interface HRProps {
  room: string;
  roomInfo: RoomInfo;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onEvaluate: (question: string,answer: string,chatindex:Number) => void;
}

export default function HR({ roomInfo, messages, onSendMessage,onEvaluate }: HRProps) {
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [candidateError, setCandidateError] = useState("");
  const [isOpenSuggest, setisOpenSuggest] = useState(true);

  // ดึงข้อมูล Candidate จาก backend
  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoadingCandidate(true);
        setCandidateError("");

        // 👇 ตรงนี้ถ้า backend ใช้ query แบบอื่น ให้แก้ URL ตรงนี้
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/candidateinfo/${roomInfo.room_code}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch candidate info");
        }

        const data = await res.json();
        // ถ้า backend ใส่ห่อเป็น { isSuccess, candidate: {...} } ให้ปรับตรงนี้ด้วย
        const candidateData: CandidateInfo = data;
        setCandidate(candidateData);
      } catch (err) {
        console.error("Failed to load candidate info", err);
        setCandidateError("Failed to load candidate information");
      } finally {
        setLoadingCandidate(false);
      }
    };

    fetchCandidate();
  }, [roomInfo.room_code]);

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:flex-row">
      {/* ======= ซ้าย: Candidate Info + Suggested Questions ======= */}
      <div className="w-full md:w-1/2 flex flex-col gap-4 md:h-[calc(100vh-7rem)] min-h-0">
        {/* บน: Candidate Info */}
        <CandidateInfoCard
          candidate={candidate}
          loadingCandidate={loadingCandidate}
          candidateError={candidateError}
        />

        {/* ล่าง: Suggested Questions */}
        <Card className={isOpenSuggest?"flex flex-col flex-1 min-h-0":"min-h-0"}>
          <CardHeader className="border-b flex flex-row justify-between items-center cursor-pointer" onClick={() => setisOpenSuggest(!isOpenSuggest)}>
            <CardTitle className="text-base">Suggested Questions</CardTitle>
            {isOpenSuggest ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </CardHeader>
          <CardContent className={`p-3 flex-1 min-h-0 ${isOpenSuggest?"block":"hidden"}`}>
            <SuggestedQuestionsPanel candidateId={candidate?._id} />
          </CardContent>
        </Card>
      </div>

      {/* ======= ขวา: Chat ======= */}
      <div className="w-full md:w-1/2 h-[70vh] md:h-[calc(100vh-7rem)]">
        <ChatPanel
          messages={messages}
          onSendMessage={onSendMessage}
          onEvaluate={onEvaluate}
          title="Interview Chat"
        />
      </div>
    </div>
  );
}
