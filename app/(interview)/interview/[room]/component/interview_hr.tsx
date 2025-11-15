// app/(interview)/interview/[room]/HR.tsx
"use client";

import { useEffect, useState } from "react";
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
}

export default function HR({ roomInfo, messages, onSendMessage }: HRProps) {
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [candidateError, setCandidateError] = useState("");

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

  // helper แสดงช่วงปีแบบอ่านง่าย
  const formatYearRange = (
    start?: { month: string; year: string },
    end?: { month: string; year: string } | null,
    isCurrent?: boolean
  ) => {
    const startY = start?.year || "";
    const endY = end?.year || "";
    if (isCurrent) return startY ? `${startY} - Present` : "Present";
    if (startY && endY) return `${startY} - ${endY}`;
    if (startY && !endY) return `${startY} -`;
    if (!startY && endY) return `- ${endY}`;
    return "";
  };

  // เลือก experience ล่าสุด (ตาม isCurrentRole หรือ endDate)
  const latestExperience =
    candidate?.experiences?.find((e) => e.isCurrentRole) ??
    (candidate?.experiences && candidate.experiences[0]);

  const latestEducation =
    candidate?.education && candidate.education.length > 0
      ? candidate.education[0]
      : null;

  const topSkills = candidate?.skills?.slice(0, 10) ?? [];

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:flex-row">
      {/* ======= ซ้าย: Candidate Info + Suggested Questions ======= */}
      <div className="w-full md:w-1/2 flex flex-col gap-4 md:h-[calc(100vh-7rem)]">
        {/* บน: Candidate Info */}
        <Card className="flex flex-col md:flex-1 h-50">
          <CardHeader className="py-3 border-b ">
            <CardTitle className="text-base">Candidate Information</CardTitle>
          </CardHeader>
          <CardContent className="p-3 overflow-y-auto">
            <ScrollArea className="md:h-full md:pr-2">
              {loadingCandidate && (
                <p className="text-xs text-muted-foreground">
                  Loading candidate info...
                </p>
              )}

              {candidateError && (
                <p className="text-xs text-destructive">{candidateError}</p>
              )}

              {!loadingCandidate && !candidateError && candidate && (
                <div className="space-y-3 text-sm text-foreground">
                  {/* Personal info */}
                  <div>
                    <p className="font-medium">
                      {candidate.personalInfo?.fullName ||
                        candidate.personalInfo?.email ||
                        "Unknown candidate"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Email:{" "}
                      {candidate.personalInfo?.email ??
                        candidate.user_email ??
                        "-"}
                    </p>
                    {candidate.personalInfo?.phone && (
                      <p className="text-xs text-muted-foreground">
                        Phone: {candidate.personalInfo.phone}
                      </p>
                    )}
                    {candidate.personalInfo?.address && (
                      <p className="text-xs text-muted-foreground">
                        Location: {candidate.personalInfo.address}
                      </p>
                    )}
                    {(candidate.personalInfo?.currentSalary ||
                      candidate.personalInfo?.expectedSalary) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Salary:{" "}
                        {candidate.personalInfo.currentSalary
                          ? `Current ${candidate.personalInfo.currentSalary}`
                          : ""}
                        {candidate.personalInfo.currentSalary &&
                          candidate.personalInfo.expectedSalary &&
                          " | "}
                        {candidate.personalInfo.expectedSalary
                          ? `Expected ${candidate.personalInfo.expectedSalary}`
                          : ""}
                      </p>
                    )}
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="font-semibold mb-1">Key Skills</p>
                    {topSkills.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No skills specified.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {topSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-full bg-muted text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Experience summary */}
                  <div>
                    <p className="font-semibold mb-1">Experience</p>
                    {latestExperience ? (
                      <div className="space-y-0.5 text-xs">
                        <p className="font-medium">
                          {latestExperience.role || "Experience"}
                          {latestExperience.level &&
                            ` (${latestExperience.level})`}
                        </p>
                        <p className="text-muted-foreground">
                          {latestExperience.company}
                        </p>
                        <p className="text-muted-foreground">
                          {formatYearRange(
                            latestExperience.startDate,
                            latestExperience.endDate,
                            latestExperience.isCurrentRole
                          )}
                        </p>
                        {latestExperience.description && (
                          <p className="mt-1 text-foreground line-clamp-3">
                            {latestExperience.description}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No experience records.
                      </p>
                    )}
                  </div>

                  {/* Education summary */}
                  <div>
                    <p className="font-semibold mb-1">Education</p>
                    {latestEducation ? (
                      <div className="space-y-0.5 text-xs">
                        <p className="font-medium">
                          {latestEducation.degree || "Degree"}
                        </p>
                        <p className="text-muted-foreground">
                          {latestEducation.institution}
                          {latestEducation.major &&
                            `, ${latestEducation.major}`}
                        </p>
                        <p className="text-muted-foreground">
                          {formatYearRange(
                            latestEducation.startDate,
                            latestEducation.endDate,
                            latestEducation.isCurrentlyStudying
                          )}
                        </p>
                        {latestEducation.gpa && (
                          <p className="text-muted-foreground">
                            GPA: {latestEducation.gpa}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No education records.
                      </p>
                    )}
                  </div>

                  {/* Certificates (ถ้ามี) */}
                  {candidate.certificates && candidate.certificates.length > 0 && (
                    <div>
                      <p className="font-semibold mb-1">Certificates</p>
                      <ul className="list-disc list-inside text-xs space-y-0.5">
                        {candidate.certificates.slice(0, 3).map((c) => (
                          <li key={c.id}>{c.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Achievements สั้น ๆ */}
                  {candidate.achievement &&
                    candidate.achievement.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1">Projects / Achievements</p>
                        <ul className="list-disc list-inside text-xs space-y-0.5">
                          {candidate.achievement.slice(0, 2).map((a) => (
                            <li key={a.id}>
                              <span className="font-medium">{a.title}</span>
                              {a.description && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  – {a.description}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              {!loadingCandidate && !candidateError && !candidate && (
                <p className="text-xs text-muted-foreground">
                  No candidate information available.
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* ล่าง: Suggested Questions (เหมือนเดิม) */}
        <Card className="flex flex-col md:flex-1">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-base">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ScrollArea className="md:h-full md:pr-2">
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
        <ChatPanel
          messages={messages}
          onSendMessage={onSendMessage}
          title="Interview Chat"
        />
      </div>
    </div>
  );
}
