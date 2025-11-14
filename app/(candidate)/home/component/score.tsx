import { useState, useEffect } from "react";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import JobDetail from "./JobDetail";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

interface RoomInfo {
  isJoin: boolean;
  room_code: string | null;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  user_email: string;
  room: RoomInfo | null;
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

export default function Score() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matchResults, setMatchResults] = useState<Map<string, MatchResult>>(new Map());
  const [loading, setLoading] = useState(true);
  const [calculatingAll, setCalculatingAll] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [msgerror, setmsgerror] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hr/jobs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();

      if (data.isSuccess) {
        setJobs(data.jobs);
      } else {
        throw new Error("Failed to fetch jobs");
      }
    } catch (error) {
      setmsgerror("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // ✅ คำนวณทีเดียวทั้งหมด
  const calculateAllMatches = async () => {
    try {
      setCalculatingAll(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/findjob`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.isSuccess && data.result) {
        const newMatches = new Map<string, MatchResult>();
        data.result.forEach((result: MatchResult) => {
          newMatches.set(result.id, result);
        });
        setMatchResults(newMatches);
        setmsgerror("Matching score calculated successfully");
      } else {
        throw new Error("Failed to calculate match");
      }
    } catch (error) {
      setmsgerror("Failed to calculate matching score");
    } finally {
      setCalculatingAll(false);
    }
  };

  const handleCreateRoom = async (jobId: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/room/create/${jobId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const data = await res.json();
    if (!data.isSuccess) {
      setmsgerror(data.error || "Failed to create room");
      return;
    }

    const roomCode = data.room_code as string;
    // ถ้าอยากให้อยู่หน้าเดิมแล้วรีเฟรชสถานะห้องด้วย:
    // await fetchJobs();
    // แล้วค่อย redirect
    router.push(`/interview/${roomCode}`);
  } catch (err) {
    setmsgerror("Failed to create room");
  }
};

const handleJoinRoom = (roomCode: string) => {
  router.push(`/interview/${roomCode}`);
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedJob = selectedJobId
    ? jobs.find((j) => j._id === selectedJobId) || null
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-12 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                All Job Positions
              </h1>
              <p className="text-muted-foreground">
                Found {jobs.length} open positions
              </p>
            </div>
            <Button
              onClick={calculateAllMatches}
              disabled={calculatingAll}
              size="lg"
              className="w-full md:w-auto"
            >
              {calculatingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating All...
                </>
              ) : (
                "Calculate All Matches"
              )}
            </Button>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No jobs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
  const match = matchResults.get(job._id);
  return (
    <JobCard
      key={job._id}
      id={job._id}
      title={job.title}
      description={job.description}
      matchingScore={match?.score}
      // 👇 เพิ่ม 3 props นี้
      room={job.room}
      onCreateRoom={() => handleCreateRoom(job._id)}
      onJoinRoom={() =>
        job.room?.room_code && handleJoinRoom(job.room.room_code)
      }
      onViewDetails={() => setSelectedJobId(job._id)}
    />
  );
})}
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedJobId}
        onOpenChange={(open) => !open && setSelectedJobId(null)}
      >
        <DialogContent className="w-full sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-lg font-semibold">Job Detail</DialogTitle>
          {selectedJob ? (
            <JobDetail
              job={selectedJob}
              matchResult={matchResults.get(selectedJob._id)}
            />
          ) : (
            <p className="text-muted-foreground">Job not found</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
