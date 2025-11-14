// app/hr/myjobs/HrJobDetail.tsx
import { HrJob } from "./jobs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HrJobDetailProps {
  job: HrJob;
}

export default function HrJobDetail({ job }: HrJobDetailProps) {
  const formatYears = (min: number | null, max: number | null) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <CardTitle className="text-2xl md:text-3xl">
                {job.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Created by {job.user_email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-start md:justify-end text-xs">
              <Badge variant="secondary">{job.skills.length} skills</Badge>
              <Badge variant="secondary">
                {job.experiences.length} experience item(s)
              </Badge>
              <Badge variant="secondary">
                {job.educations.length} education rule(s)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          <div>
            <h3 className="font-semibold mb-3">Job Description</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Required Skills</span>
            <Badge variant="outline">{job.skills.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {job.skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No specific skills specified.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Experience Requirements</span>
            <Badge variant="outline">{job.experiences.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.experiences.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No specific experience requirements.
            </p>
          ) : (
            job.experiences.map((exp, idx) => (
              <div
                key={idx}
                className="border-l-2 border-border pl-4 py-2 space-y-1"
              >
                <p className="text-sm font-medium">
                  {exp.job_name || "Experience"}
                  {exp.level && ` (${exp.level})`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatYears(exp.min_experience_years, exp.max_experience_years)}
                </p>
                {exp.description && (
                  <p className="text-sm text-foreground">
                    {exp.description}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Education Requirements</span>
            <Badge variant="outline">{job.educations.length} rules</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.educations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No specific education requirements.
            </p>
          ) : (
            job.educations.map((eduRule) => (
              <div
                key={eduRule.id}
                className="border-l-2 border-border pl-4 py-2 space-y-1"
              >
                <p className="text-sm font-medium">
                  Minimum: {eduRule.minimum_level}
                </p>
                {eduRule.education.length > 0 && (
                  <p className="text-sm text-foreground">
                    Fields: {eduRule.education.join(", ")}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Responsibilities</span>
            <Badge variant="outline">
              {job.responsibilities.length} item
              {job.responsibilities.length !== 1 && "s"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {job.responsibilities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No responsibilities listed for this job.
            </p>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
              {job.responsibilities.map((resp, idx) => (
                <li key={idx}>{resp}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
