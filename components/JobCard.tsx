import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoomInfo {
  isJoin: boolean;
  room_code: string | null;
}

interface JobCardProps {
  id: string;
  title: string;
  description: string;
  matchingScore?: number;
  onViewDetails: () => void;
  room?: RoomInfo | null;               // 👈 เพิ่ม
  onCreateRoom?: () => void;            // 👈 เพิ่ม
  onJoinRoom?: () => void;              // 👈 เพิ่ม
}

export const JobCard = ({
  id,
  title,
  description,
  matchingScore,
  onViewDetails,
  room,
  onCreateRoom,
  onJoinRoom,
}: JobCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-success";
    if (score >= 0.4) return "text-warning";
    return "text-destructive";
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-foreground/20 flex flex-col h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {matchingScore !== undefined && (
            <Badge
              variant="secondary"
              className={`${getScoreColor(matchingScore)} shrink-0`}
            >
              {Math.round(matchingScore * 100)}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {truncateDescription(description)}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onViewDetails}
          className="flex-1"
        >
          View Details
        </Button>
        {room === null && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onCreateRoom}
          >
            Create Room
          </Button>
        )}

        {room && room.isJoin === false && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled
          >
            In Interview
          </Button>
        )}

        {room && room.isJoin === true && room.room_code && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onJoinRoom}
          >
            Join Room
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
