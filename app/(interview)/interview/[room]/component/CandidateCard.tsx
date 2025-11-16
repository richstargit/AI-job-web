"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight } from "lucide-react";

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

export default function CandidateInfoCard({
  candidate,
  loadingCandidate,
  candidateError,
}: {
  candidate: CandidateInfo | null;
  loadingCandidate: boolean;
  candidateError: string;
}) {
  const [open, setOpen] = useState(true);

  const formatYearRange = (
    start?: { month: string; year: string },
    end?: { month: string; year: string } | null,
    isCurrent?: boolean
  ) => {
    const startY = start?.year || "";
    const endY = end?.year || "";

    if (isCurrent) return `${startY} - Present`;
    if (startY && endY) return `${startY} - ${endY}`;
    if (startY && !endY) return `${startY} -`;
    if (!startY && endY) return `- ${endY}`;
    return "";
  };

  return (
    <Card className={open ? "flex flex-col md:flex-1 min-h-0" : ""}>
      <CardHeader
        className="border-b flex flex-row justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <CardTitle className="text-base">Candidate Information</CardTitle>
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </CardHeader>

      {open && (
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
              <div className="space-y-4 text-sm text-foreground">
                {/* Personal Info */}
                <div>
                  <p className="font-medium">
                    {candidate.personalInfo?.fullName ||
                      candidate.personalInfo?.email ||
                      "Unknown candidate"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email: {candidate.personalInfo?.email ?? candidate.user_email ?? "-"}
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
                </div>

                {/* Skills (ทั้งหมด ไม่ slice แล้ว) */}
                <div>
                  <p className="font-semibold mb-1">Skills</p>
                  {candidate.skills.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No skills specified.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((s) => (
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

                {/* Experience ทั้งหมด */}
                <div>
                  <p className="font-semibold mb-1">Experience</p>
                  {candidate.experiences.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No experience records.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {candidate.experiences.map((exp) => (
                        <div key={exp.id} className="space-y-0.5 text-xs">
                          <p className="font-medium">
                            {exp.role}
                            {exp.level && ` (${exp.level})`}
                            {exp.isCurrentRole && (
                              <span className="ml-1 text-[10px] text-emerald-600">
                                • Current
                              </span>
                            )}
                          </p>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <p className="text-muted-foreground">
                            {formatYearRange(
                              exp.startDate,
                              exp.endDate,
                              exp.isCurrentRole
                            )}
                          </p>
                          {exp.description && (
                            <p className="text-[11px] text-muted-foreground">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education ทั้งหมด */}
                <div>
                  <p className="font-semibold mb-1">Education</p>
                  {candidate.education.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No education records.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {candidate.education.map((edu) => (
                        <div key={edu.id} className="space-y-0.5 text-xs">
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-muted-foreground">
                            {edu.institution}
                            {edu.faculty && `, ${edu.faculty}`}
                            {edu.major && `, ${edu.major}`}
                          </p>
                          <p className="text-muted-foreground">
                            {formatYearRange(
                              edu.startDate,
                              edu.endDate,
                              edu.isCurrentlyStudying
                            )}
                          </p>
                          {edu.gpa && (
                            <p className="text-[11px] text-muted-foreground">
                              GPA: {edu.gpa}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certificates */}
                <div>
                  <p className="font-semibold mb-1">Certificates</p>
                  {candidate.certificates.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No certificates.
                    </p>
                  ) : (
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                      {candidate.certificates.map((cert) => (
                        <li key={cert.id}>{cert.name}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Achievements / Projects */}
                <div>
                  <p className="font-semibold mb-1">Achievements / Projects</p>
                  {candidate.achievement.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No achievements.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {candidate.achievement.map((ach) => (
                        <div key={ach.id} className="space-y-0.5 text-xs">
                          <p className="font-medium">{ach.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {ach.description}
                          </p>
                          {ach.technologies?.length > 0 && (
                            <p className="text-[11px] text-muted-foreground">
                              Tech: {ach.technologies.join(", ")}
                            </p>
                          )}
                          {ach.link && (
                            <a
                              href={ach.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-primary underline"
                            >
                              View more
                            </a>
                          )}
                          <p className="text-[11px] text-muted-foreground">
                            {formatYearRange(ach.startDate, ach.endDate)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
