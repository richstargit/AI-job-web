import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Job {
  _id: string;
  title: string;
  description: string;
  user_email: string;
}

interface MatchResult {
  id: string;
  name: string;
  score: number;
  skill: {
    score: number;
    match: string[];
    maybehave: string[];
    miss: string[];
  };
  experience: {
    score: number;
    match: string[];
    miss: string[];
  };
  education: {
    score: number;
    match: string[];
    miss: string[];
  };
  responsibilities: {
    score: number;
    reasons: Array<{
      job: string;
      candidate: string;
      reason: string;
    }>;
  };
}

interface JobDetailProps {
  job: Job;
  matchResult?: MatchResult; // อาจจะ undefined ถ้ายังไม่ได้กด Calculate All
}

// ✅ helper สำหรับ sub-score: แปลงเป็น label + badge variant
const formatSubScore = (score: number) => {
  if (score < 0) {
    return {
      label: "Not required",
      variant: "outline" as const,
    };
  }
  const pct = Math.round(score * 100);
  return {
    label: `${pct}%`,
    variant: (score >= 0.5 ? "default" : "destructive") as
      | "default"
      | "destructive",
  };
};

const getScoreColor = (score: number) => {
  if (score >= 0.7) return "text-success";
  if (score >= 0.4) return "text-warning";
  return "text-destructive";
};

const getScoreLabel = (score: number) => {
  if (score >= 0.7) return "Excellent Match";
  if (score >= 0.4) return "Good Match";
  return "Poor Match";
};

export default function JobDetail({ job, matchResult }: JobDetailProps) {
  return (
    <div className="space-y-6">
      {/* Job Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl md:text-3xl mb-2">
                {job.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{job.user_email}</p>
            </div>
            {matchResult && (
              <div className="text-center md:text-right">
                <div
                  className={`text-4xl font-bold ${getScoreColor(
                    matchResult.score
                  )}`}
                >
                  {Math.round(matchResult.score * 100)}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getScoreLabel(matchResult.score)}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!matchResult && (
            <div className="mb-4 text-sm text-muted-foreground">
              Matching score has not been calculated yet.{" "}
              Please click <strong>Calculate All Matches</strong> on the main
              page.
            </div>
          )}
          <Separator className="my-4" />
          <div>
            <h3 className="font-semibold mb-3">Job Description</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Matching Details */}
      {matchResult && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* ========= Skills ========= */}
          <Card>
            <CardHeader>
              {(() => {
                const s = formatSubScore(matchResult.skill.score);
                return (
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Skills</span>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </CardTitle>
                );
              })()}
            </CardHeader>
            <CardContent className="space-y-4">
              {matchResult.skill.match.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <p className="text-sm font-medium">Matched Skills</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.skill.match.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-success"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {matchResult.skill.maybehave.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <p className="text-sm font-medium">Possible Skills</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.skill.maybehave.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-warning"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {matchResult.skill.miss.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-medium">Missing Skills</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.skill.miss.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ========= Experience ========= */}
          <Card>
            <CardHeader>
              {(() => {
                const s = formatSubScore(matchResult.experience.score);
                return (
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Experience</span>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </CardTitle>
                );
              })()}
            </CardHeader>
            <CardContent className="space-y-4">
              {matchResult.experience.score < 0 ? (
                <p className="text-sm text-muted-foreground">
                  This job does not specify experience requirements.
                </p>
              ) : (
                <>
                  {matchResult.experience.match.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <p className="text-sm font-medium">Matched Experience</p>
                      </div>
                      <div className="space-y-1">
                        {matchResult.experience.match.map((exp, idx) => (
                          <p key={idx} className="text-sm text-foreground">
                            • {exp}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchResult.experience.miss.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <p className="text-sm font-medium">
                          Missing Experience
                        </p>
                      </div>
                      <div className="space-y-1">
                        {matchResult.experience.miss.map((exp, idx) => (
                          <p
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            • {exp}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ========= Education ========= */}
          <Card>
            <CardHeader>
              {(() => {
                const s = formatSubScore(matchResult.education.score);
                return (
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Education</span>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </CardTitle>
                );
              })()}
            </CardHeader>
            <CardContent className="space-y-4">
              {matchResult.education.score < 0 ? (
                <p className="text-sm text-muted-foreground">
                  This job does not specify education requirements.
                </p>
              ) : (
                <>
                  {matchResult.education.match.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <p className="text-sm font-medium">
                          Matched Education
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.education.match.map((edu, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-success"
                          >
                            {edu}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchResult.education.miss.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <p className="text-sm font-medium">
                          Missing Education
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.education.miss.map((edu, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            {edu}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ========= Responsibilities ========= */}
          <Card className="md:col-span-2">
            <CardHeader>
              {(() => {
                const s = formatSubScore(matchResult.responsibilities.score);
                return (
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Responsibilities Analysis</span>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </CardTitle>
                );
              })()}
            </CardHeader>
            <CardContent>
              {matchResult.responsibilities.score < 0 ? (
                <p className="text-sm text-muted-foreground">
                  This job does not specify responsibility details.
                </p>
              ) : (
                <div className="space-y-4">
                  {matchResult.responsibilities.reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="border-l-2 border-border pl-4 py-2"
                    >
                      <p className="text-sm font-medium mb-2">{reason.job}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Candidate:</span>{" "}
                          {reason.candidate}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Reason:</span>{" "}
                          {reason.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
