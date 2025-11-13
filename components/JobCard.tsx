import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobCardProps {
  id: string;
  title: string;
  description: string;
  matchingScore?: number;
  onViewDetails: () => void;
}

export const JobCard = ({
  id,
  title,
  description,
  matchingScore,
  onViewDetails,
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
      </CardFooter>
    </Card>
  );
};
