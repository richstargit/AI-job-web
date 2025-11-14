// components/hr/HrJobCard.tsx
import { HrJob } from "@/app/(hr)/hr/component/jobs";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HrJobCardProps {
  job: HrJob;
  onViewDetails: () => void;
  onJoinRoom?: () => void;
}

export const HrJobCard = ({ job, onViewDetails,onJoinRoom }: HrJobCardProps) => {
  const truncate = (text: string, maxLength: number = 140) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-foreground/20 flex flex-col h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            {job.skills.length} skills
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Posted by {job.user_email}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {truncate(job.description.replace(/\n+/g, " "))}
        </p>

        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{job.experiences.length} experience item(s)</span>
          <span>{job.educations.length} education rule(s)</span>
          <span>{job.responsibilities.length} responsibility item(s)</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row">
  <Button
    size="sm"
    className="w-full sm:flex-1"
    onClick={onViewDetails}
  >
    View Details
  </Button>

  {/* 👇 ปุ่มด้านขวาตามสถานะ room */}
  {job.room && job.room.room_code ? (
    <Button
      size="sm"
      variant="outline"
      className="w-full sm:flex-1"
      onClick={onJoinRoom}
    >
      Join Room
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline"
      className="w-full sm:flex-1"
      disabled
    >
      Waiting for candidate
    </Button>
  )}
</CardFooter>
    </Card>
  );
};
