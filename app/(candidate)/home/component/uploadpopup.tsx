"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DateInfo {
  month: string;
  year: string;
}

interface Experience {
  id: number;
  role: string;
  level: string;
  company: string;
  startDate: DateInfo;
  endDate: DateInfo | null;
  description: string;
  isCurrentRole: boolean;
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  faculty: string;
  major: string;
  startDate: DateInfo;
  endDate: DateInfo | null;
  gpa: string;
  isCurrentlyStudying: boolean;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  technologies: string[];
}

interface CandidateInfo {
  _id: string;
  user_email: string;
  personalInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    birthDate: string | null;
    currentSalary: number;
    expectedSalary: number;
  };
  skills: string[];
  experiences: Experience[];
  education: Education[];
  certificates: any[];
  achievement: Achievement[];
  skill_Graph: string[];
  skill_Maybe: string[];
}

function formatPeriod(
  start?: DateInfo,
  end?: DateInfo | null,
  isCurrent?: boolean
) {
  const s =
    start && start.month && start.year
      ? `${start.month} ${start.year}`
      : "";
  const e = isCurrent
    ? "Present"
    : end && end.month && end.year
    ? `${end.month} ${end.year}`
    : "";
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

export default function UploadPopup() {
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setUploadSuccess(false);
      setUploadError(null);
    }
  };

  const fetchCandidateInfo = async () => {
    setLoadingInfo(true);
    setInfoError(null);
    try {
      const res = await fetch(`${API_URL}/users/candidateinfo`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || "error" in data) {
        setCandidate(null);
        setInfoError(data.error ?? "ไม่พบข้อมูลผู้สมัครในระบบ");
      } else {
        setCandidate(data as CandidateInfo);
      }
    } catch (err) {
      setCandidate(null);
      setInfoError("ไม่สามารถโหลดข้อมูลผู้สมัครได้");
    } finally {
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    fetchCandidateInfo();
  }, []);

  const handleUploadResume = async () => {
    if (!resumeFile) return;

    setUploading(true);
    setUploadSuccess(false);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", resumeFile);

    try {
      const response = await fetch(`${API_URL}/users/addcandidate`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.isSuccess) {
        setResumeFile(null);
        setUploadSuccess(true);
        await fetchCandidateInfo(); // refresh profile
      } else {
        throw new Error(data.error ?? "Upload failed");
      }
    } catch (error) {
      setUploadError("อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== TOP: PROFILE / SKILLS / ACHIEVEMENTS ===== */}
      {loadingInfo ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : candidate ? (
        <div className="flex  flex-col gap-4">
          {/* LEFT: PROFILE */}
          <Card className="border bg-black text-white">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl font-semibold leading-tight">
                    {candidate.personalInfo.fullName}
                  </CardTitle>
                  <p className="mt-1 text-xs text-neutral-300">
                    {candidate.personalInfo.email}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {candidate.personalInfo.phone}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-neutral-500 bg-neutral-900 text-[10px] uppercase tracking-wide text-neutral-200"
                >
                  Candidate Profile
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Address
                </p>
                <p className="mt-1 text-xs text-neutral-200 leading-relaxed">
                  {candidate.personalInfo.address || "-"}
                </p>
              </div>

              {candidate.education && candidate.education.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                    Education
                  </p>
                  <div className="mt-1 space-y-1.5">
                    {candidate.education.map((edu) => (
                      <div key={edu.id}>
                        <p className="text-xs font-medium text-neutral-100">
                          {edu.degree} in {edu.major}
                        </p>
                        <p className="text-[11px] text-neutral-300">
                          {edu.institution}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {formatPeriod(
                            edu.startDate,
                            edu.endDate,
                            edu.isCurrentlyStudying
                          )}
                          {edu.gpa && ` · GPA ${edu.gpa}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: SCROLLABLE SKILLS + ACHIEVEMENTS */}
          <Card className="border bg-white text-black">
            <CardContent className="pt-4">
              <ScrollArea className="pr-2">
                <div className="space-y-4 text-sm">
                  {/* Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                        Skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {candidate.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experiences */}
                  {candidate.experiences &&
                    candidate.experiences.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                          Experience
                        </p>
                        <div className="mt-2 space-y-2.5">
                          {candidate.experiences.map((exp) => (
                            <div
                              key={exp.id}
                              className="rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-neutral-900">
                                  {exp.role}{" "}
                                  <span className="text-[11px] font-normal text-neutral-500">
                                    @ {exp.company}
                                  </span>
                                </p>
                                <span className="text-[10px] uppercase tracking-wide text-neutral-400">
                                  {formatPeriod(
                                    exp.startDate,
                                    exp.endDate,
                                    exp.isCurrentRole
                                  )}
                                </span>
                              </div>
                              {exp.description && (
                                <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Achievements */}
                  {candidate.achievement &&
                    candidate.achievement.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                          Highlight Projects / Achievements
                        </p>
                        <div className="mt-2 space-y-2.5">
                          {candidate.achievement.map((ach) => (
                            <div key={ach.id} className="space-y-1">
                              <p className="text-xs font-semibold text-neutral-900">
                                {ach.title}
                              </p>
                              {ach.description && (
                                <p className="text-[11px] leading-relaxed text-neutral-600">
                                  {ach.description}
                                </p>
                              )}
                              {ach.technologies &&
                                ach.technologies.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {ach.technologies.map((tech) => (
                                      <span
                                        key={tech}
                                        className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-50"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      ) : (
        // ไม่มี candidate ใน DB
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-700">
          <p className="font-medium">
            ยังไม่มีข้อมูลโปรไฟล์จากไฟล์ Resume ในระบบ
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            อัปโหลด Resume ของคุณเพื่อให้ระบบสร้างโปรไฟล์อัตโนมัติ
          </p>
          {infoError && (
            <p className="mt-2 text-xs text-neutral-400">({infoError})</p>
          )}
        </div>
      )}

      <Separator />

      {/* ===== BOTTOM: UPLOAD CARD เต็มความกว้าง ===== */}
      <Card className="border border-dashed border-neutral-300 bg-neutral-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-neutral-900">
            Upload / Update Resume
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="resume"
              className="text-xs font-medium text-neutral-700"
            >
              Resume File (PDF)
            </Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="cursor-pointer border-neutral-300 text-xs file:text-xs"
            />
            {resumeFile && (
              <p className="text-[11px] text-neutral-500">
                เลือกไฟล์:{" "}
                <span className="font-medium text-neutral-800">
                  {resumeFile.name}
                </span>
              </p>
            )}
            <p className="text-[11px] text-neutral-400">
              รองรับไฟล์ .pdf ขนาดไม่เกินที่กำหนด
            </p>
          </div>

          {uploadError && (
            <p className="text-[11px] text-red-500">{uploadError}</p>
          )}
          {uploadSuccess && (
            <p className="text-[11px] text-emerald-600">
              อัปโหลดสำเร็จแล้ว ระบบได้อัปเดตข้อมูลโปรไฟล์ให้เรียบร้อย 🎉
            </p>
          )}

          <Button
            onClick={handleUploadResume}
            disabled={!resumeFile || uploading}
            className="w-full bg-black text-white hover:bg-neutral-800"
          >
            {uploading ? (
              <span className="inline-flex items-center gap-2 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                กำลังอัปโหลด...
              </span>
            ) : (
              <span className="text-xs">Upload Resume</span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
