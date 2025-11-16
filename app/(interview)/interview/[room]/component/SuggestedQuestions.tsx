"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuestions } from "./QuestionContext";
import { useFollowUps } from "./Follow-upContext";
// import { Button } from "@/components/ui/button";

type TopicKey = "skills" | "education" | "experience";

interface BackendQuestion {
  id: number;
  question: string;
  answer: string | null;
  difficulty: "easy" | "medium" | "hard";
  followUpTopics: string[];
}

interface QuestionWithSelect extends BackendQuestion {
  isSelect: boolean; // 👈 ตามที่ขอ
}

interface GenerateQuestionsResponse {
  questions: BackendQuestion[];
  topic: string;
  totalQuestionsAsked: number;
}

interface SuggestedQuestionsPanelProps {
  candidateId?: string; // ได้จาก candidateinfo._id
}

const TOPIC_CONFIG: {
  key: TopicKey;
  label: string;
  endpoint: string;
}[] = [
  {
    key: "skills",
    label: "Skills",
    endpoint: "/questions/generate-skills",
  },
  {
    key: "education",
    label: "Education",
    endpoint: "/questions/generate-education",
  },
  {
    key: "experience",
    label: "Experience",
    endpoint: "/questions/generate-experience",
  },
];

type QuestionsByTopic = Record<TopicKey, QuestionWithSelect[]>;

export default function SuggestedQuestionsPanel({
  candidateId,
}: SuggestedQuestionsPanelProps) {
  const [activeTopic, setActiveTopic] = useState<TopicKey>("skills");
  const { questionsByTopic, setQuestionsByTopic } = useQuestions();

  const [isFollowUp, setisFollowUp] = useState(false);
  const [FollowUpRead, setFollowUpRead] = useState(0);

  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState<string>("");

  // ไว้ต่อกับ RAG ภายหลัง
  const [previousQuestions] = useState<string[]>([]);
  const [selectedQuestions] = useState<string[]>([]);

  // คิว follow-up รวมอันเดียว
  const {followUpQueue, setFollowUpQueue} = useFollowUps();

  // helper: map data จาก backend ใส่ isSelect
  const mapWithSelect = (questions: BackendQuestion[]): QuestionWithSelect[] =>
    questions.map((q) => ({
      ...q,
      isSelect: false,
    }));

  // preload ทุก topic เมื่อรู้ candidateId
  useEffect(() => {
    if (!candidateId) return;

    const prefetchAllTopics = async () => {
      setLoadingAll(true);
      setError("");

      try {
        const promises = TOPIC_CONFIG.map(async (cfg) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${cfg.endpoint}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // 👈 รอ cookie ด้วย
              body: JSON.stringify({
                topic: cfg.key,
                candidateId,
                previousQuestions,
                selectedQuestions,
              }),
            }
          );

          if (!res.ok) {
            throw new Error(
              `Failed to fetch questions for topic: ${cfg.key}`
            );
          }

          const data: GenerateQuestionsResponse = await res.json();

          return {
            topic: cfg.key as TopicKey,
            questions: mapWithSelect(data.questions),
          };
        });

        const results = await Promise.all(promises);

        const merged: QuestionsByTopic = {
          skills: [],
          education: [],
          experience: [],
        };

        for (const r of results) {
          merged[r.topic] = r.questions;
        }

        setQuestionsByTopic(merged);
      } catch (err) {
        console.error("Failed to prefetch suggested questions", err);
        setError("Failed to prefetch suggested questions");
        setQuestionsByTopic({
          skills: [],
          education: [],
          experience: [],
        });
      } finally {
        setLoadingAll(false);
      }
    };

    prefetchAllTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  // toggle isSelect เฉพาะใน topic ปัจจุบัน + จัดการ queue follow-up รวม
//   const toggleSelect = (id: number) => {
//   let addItems: FollowUpItem[] = [];
//   let removeKey: { qid: number; topic: string } | null = null;

//   // 1) อัปเดตสถานะคำถาม และเก็บ follow-up ที่ต้องเพิ่ม/ลบ
//   setQuestionsByTopic((prev) => {
//     const updated = prev[activeTopic].map((q) => {
//       if (q.id !== id) return q;

//       const willSelect = !q.isSelect;

//       if (willSelect) {
//         addItems =
//           q.followUpTopics?.map((t, idx) => ({
//             id: `${activeTopic}-${q.id}-${idx}`,
//             text: t,
//             sourceQuestionId: q.id,
//             sourceTopic: activeTopic,
//           })) ?? [];
//       } else {
//         removeKey = { qid: q.id, topic: activeTopic };
//       }

//       return { ...q, isSelect: willSelect };
//     });

//     return { ...prev, [activeTopic]: updated };
//   });

//   // 2) เพิ่ม follow-up
//   if (addItems.length) {
//     setFollowUpQueue((prev) => {
//       const merged = [...prev];
//       addItems.forEach((item) => {
//         if (!merged.some((m) => m.id === item.id)) merged.push(item);
//       });
//       return merged;
//     });
//   }

//   // 3) ลบ follow-up
//   if (removeKey) {
//     setFollowUpQueue((prev) =>
//       prev.filter(
//         (i) => !(i.sourceQuestionId === removeKey!.qid && i.sourceTopic === removeKey!.topic)
//       )
//     );
//   }
// };


  // ถ้าอยากใช้ Regenerate ทีหลัง ค่อยปลดคอมเมนต์ได้
  /*
  const refreshCurrentTopic = async () => {
    if (!candidateId) return;

    const cfg = TOPIC_CONFIG.find((t) => t.key === activeTopic);
    if (!cfg) return;

    setLoadingAll(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${cfg.endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            topic: activeTopic,
            candidateId,
            previousQuestions,
            selectedQuestions,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to refresh questions");
      }

      const data: GenerateQuestionsResponse = await res.json();

      setQuestionsByTopic((prev) => ({
        ...prev,
        [activeTopic]: mapWithSelect(data.questions),
      }));

      // ถ้าอยากเคลียร์ follow-up ที่มาจาก topic นี้
      setFollowUpQueue((prevQueue) =>
        prevQueue.filter((item) => item.sourceTopic !== activeTopic)
      );
    } catch (err) {
      console.error("Failed to refresh questions", err);
      setError("Failed to refresh questions");
    } finally {
      setLoadingAll(false);
    }
  };
  */

  const currentQuestions = questionsByTopic[activeTopic];

  return (
    <div className="flex flex-col gap-4 text-sm h-full">
      {/* แถบเลือก Topic หลัก */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center rounded-full border bg-muted p-0.5">
          {TOPIC_CONFIG.map((topic) => {
            const isActive = isFollowUp?false:topic.key === activeTopic;
            return (
              <button
                key={topic.key}
                type="button"
                onClick={() => {
                  setActiveTopic(topic.key)
                  setisFollowUp((prv)=>{
                    if(prv){
                      setFollowUpRead(followUpQueue.length)
                    } 
                    return false})
                }}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background"
                }`}
              >
                {topic.label}
              </button>
            );
          })}
        </div>

        <div className="inline-flex items-center rounded-full border bg-muted p-0.5">
          <button
                type="button"
                onClick={() => {
                  setisFollowUp(true)
                }}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  isFollowUp
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background"
                }`}
              >
                Follow-up
              </button>
              {followUpQueue.length-FollowUpRead>0 && <p className="px-2 py-1 ml-1 text-xs rounded-full transition-all bg-primary text-primary-foreground shadow-sm">{followUpQueue.length-FollowUpRead}</p>}
        </div>

        {/* ปุ่ม Regenerate ถ้าจะใช้ทีหลัง */}
        {/* 
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refreshCurrentTopic}
          disabled={loadingAll || !candidateId}
        >
          Regenerate
        </Button>
        */}
      </div>

      {!candidateId && (
        <p className="text-xs text-muted-foreground">
          Candidate ID not available. Please check candidate info.
        </p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      
      {loadingAll && (
        <div className="space-y-2 overflow-y-auto">
          <p className="text-[11px] text-muted-foreground">
            Generating suggested questions...
          </p>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      )}

      {/* รายการคำถามหลักของ topic ปัจจุบัน */}
      {!loadingAll &&
        currentQuestions.length === 0 &&
        candidateId &&
        !error && (
          <p className="text-xs text-muted-foreground">
            No suggested questions for this topic yet.
          </p>
        )}

      {!loadingAll && !isFollowUp && currentQuestions.length > 0 && (
        <ScrollArea className="pr-2 overflow-y-auto">
          <div className="space-y-2">
            {currentQuestions.map((q) => (
              <button
                key={q.id}
                type="button"
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  q.isSelect
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-background hover:bg-muted/60"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      #{q.id}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-normal border ${
                        q.difficulty === "easy"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : q.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {q.difficulty.toUpperCase()}
                    </Badge>
                  </div>

                  {q.isSelect && (
                    <span className="text-[10px] font-medium text-primary">
                      Selected
                    </span>
                  )}
                </div>

                <p className="text-m leading-snug select-text">{q.question}</p>

                {/* followUpTopics ไม่โชว์ตรงนี้แล้ว */}
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Follow-up queue รวม */}
      {!loadingAll && isFollowUp &&
      (<div className="space-y-2 ">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold">Follow-up Questions</p>
          {followUpQueue.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {followUpQueue.length} in queue
            </span>
          )}
        </div>
        </div>
      )}
        {!loadingAll && isFollowUp && followUpQueue.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            Select a main question to add its follow-up topics here.
          </p>
        )}
         {!loadingAll && isFollowUp && followUpQueue.length > 0 &&(
          <ScrollArea className="pr-2 overflow-y-auto">
            <div className="space-y-2 ">
              {[...followUpQueue].slice().reverse().map((item, idx) => (
                <div
                  key={item.id}
                  className={`w-full rounded-lg border ${FollowUpRead>=followUpQueue.length-idx?"border-border bg-background hover:bg-muted/60":"border-primary bg-primary/5 shadow-sm"} px-3 py-2 text-left text-xs transition-all`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[12px] font-mono text-muted-foreground">
                      {item.sourceTopic} Question-{item.sourceQuestionId}
                    </span>
                  </div>
                  <p className="text-[14px] font-mono">{item.text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
    </div>
  );
}
