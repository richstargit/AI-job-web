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

// ==== types ของ job ตาม API /hr/jobinfo/[room_code] ====
interface HrExperience {
  job_name: string;
  level: string;
  min_experience_years: number | null;
  max_experience_years: number | null;
  description: string;
}

interface HrEducation {
  id: number;
  education: string[];
  minimum_level: string;
}

interface HrJob {
  _id: string;
  user_email: string;
  description: string;
  title: string;
  skills: string[];
  experiences: HrExperience[];
  educations: HrEducation[];
  responsibilities: string[];
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
  const [job, setJob] = useState<HrJob | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);
  const [jobError, setJobError] = useState("");

  // helper format ปีของประสบการณ์
  const formatYears = (
    min: number | null,
    max: number | null
  ): string => {
    if (min == null && max == null) return "";
    if (min != null && max != null && min === max) {
      return `${min} year${min > 1 ? "s" : ""}`;
    }
    if (min != null && max != null) {
      return `${min}-${max} years`;
    }
    if (min != null && max == null) {
      return `${min}+ years`;
    }
    if (min == null && max != null) {
      return `up to ${max} years`;
    }
    return "";
  };

  // โหลด job info จาก room_code
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoadingJob(true);
        setJobError("");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hr/jobinfo/${roomInfo.room_code}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok || !data.isSuccess || !data.job) {
          throw new Error("Failed to fetch job info");
        }

        setJob(data.job as HrJob);
      } catch (err) {
        console.error("Failed to load job info", err);
        setJobError("Failed to load job information");
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
  }, [roomInfo.room_code]);

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4">
      {/* ซ้าย: Job Info */}
      <div className="w-full md:w-1/2 h-[70vh] md:h-[calc(100vh-7rem)]">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-base">Job Information</CardTitle>
          </CardHeader>

          {/* flex-1 + overflow-hidden ให้ ScrollArea ทำงาน */}
          <CardContent className="flex-1 p-3 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              {loadingJob && (
                <p className="text-xs text-muted-foreground">
                  Loading job information...
                </p>
              )}

              {jobError && (
                <p className="text-xs text-destructive">{jobError}</p>
              )}

              {!loadingJob && !jobError && job && (
                <div className="space-y-4 text-sm text-foreground">
                  {/* Title + email */}
                  <div>
                    <p className="font-semibold text-base">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Posted by {job.user_email}
                    </p>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="font-semibold mb-1">Required Skills</p>
                    {job.skills.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No specific skills specified.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-full bg-muted text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Experience requirements */}
                  <div>
                    <p className="font-semibold mb-1">
                      Experience Requirements
                    </p>
                    {job.experiences.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No specific experience requirements.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {job.experiences.map((exp, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-border pl-3 py-1 space-y-0.5"
                          >
                            <p className="text-sm font-medium">
                              {exp.job_name || "Experience"}
                              {exp.level && ` (${exp.level})`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatYears(
                                exp.min_experience_years,
                                exp.max_experience_years
                              )}
                            </p>
                            {exp.description && (
                              <p className="text-xs text-foreground">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Education requirements */}
                  <div>
                    <p className="font-semibold mb-1">
                      Education Requirements
                    </p>
                    {job.educations.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No specific education requirements.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {job.educations.map((edu) => (
                          <div
                            key={edu.id}
                            className="border-l-2 border-border pl-3 py-1 space-y-0.5"
                          >
                            <p className="text-sm font-medium">
                              Minimum: {edu.minimum_level}
                            </p>
                            {edu.education.length > 0 && (
                              <p className="text-xs text-foreground">
                                Fields: {edu.education.join(", ")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Responsibilities */}
                  <div>
                    <p className="font-semibold mb-1">Responsibilities</p>
                    {job.responsibilities.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No responsibilities listed for this job.
                      </p>
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-xs text-foreground">
                        {job.responsibilities.map((resp, idx) => (
                          <li key={idx}>{resp}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Description (raw) */}
                  <div>
                    <p className="font-semibold mb-1">Full Description</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                </div>
              )}

              {!loadingJob && !jobError && !job && (
                <p className="text-xs text-muted-foreground">
                  No job information available.
                </p>
              )}
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
