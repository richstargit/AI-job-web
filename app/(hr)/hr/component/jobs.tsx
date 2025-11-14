

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HrJobCard } from "@/components/HrJobCard";
import HrJobDetail from "./HrJobDetail";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

export interface HrExperience {
  job_name: string;
  level: string;
  min_experience_years: number | null;
  max_experience_years: number | null;
  description: string;
}

export interface HrEducation {
  id: number;
  education: string[];
  minimum_level: string; // eg. "Bachelor's degree"
}

export interface HrJob {
  _id: string;
  user_email: string;
  description: string;
  title: string;
  skills: string[];
  experiences: HrExperience[];
  educations: HrEducation[];
  responsibilities: string[];
  room: {
    isJoin: boolean;
    room_code: string | null;
  } | null;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<HrJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hr/myjobs`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!data.isSuccess) {
        throw new Error("Failed to fetch my jobs");
      }

      setJobs(data.jobs);
    } catch (err) {
      setError("Failed to load your jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomCode: string) => {
    router.push(`/interview/${roomCode}`);
  };

  const selectedJob = selectedJobId
    ? jobs.find((j) => j._id === selectedJobId) || null
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              My Job Posts
            </h1>
            <p className="text-muted-foreground">
              You have {jobs.length} job{jobs.length !== 1 && "s"} created
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMyJobs}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-destructive">{error}</div>
        )}

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              You don&apos;t have any job posts yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <HrJobCard
                key={job._id}
                job={job}
                onViewDetails={() => setSelectedJobId(job._id)}
                onJoinRoom={
                  job.room && job.room.room_code
                    ? () => handleJoinRoom(job.room!.room_code!)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog แสดงรายละเอียดของ Job ที่ HR สร้าง */}
      <Dialog
        open={!!selectedJobId}
        onOpenChange={(open) => !open && setSelectedJobId(null)}
      >
        <DialogContent className="w-full sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="text-lg font-semibold">Job Detail</DialogTitle>
          {selectedJob ? (
            <HrJobDetail job={selectedJob} />
          ) : (
            <p className="text-muted-foreground">Job not found</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
