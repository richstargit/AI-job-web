// app/(interview)/interview/[room]/ChatPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "./InterviewPage";
import { cn } from "@/lib/utils";
import { useQuestions } from "./QuestionContext";
import { EvalBadge } from "./EvalBadge";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string,question?:{Question:string,topic:string}[]) => void;
  title?: string;
  onEvaluate?: (question:string,answer:string,chatindex:Number) => void;
}

export function ChatPanel({ messages, onSendMessage, title, onEvaluate }: ChatPanelProps) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [evaluatingMessageIds, setEvaluatingMessageIds] = useState<string[]>([]);

  const { questionsByTopic } = useQuestions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const ques :{Question:string,topic:string}[] = []

    questionsByTopic.skills.map((d,_)=>{
      ques.push({
        Question:d.question,
        topic:"skills"
      })
    })
    questionsByTopic.experience.map((d,_)=>{
      ques.push({
        Question:d.question,
        topic:"experience"
      })
    })
    questionsByTopic.education.map((d,_)=>{
      ques.push({
        Question:d.question,
        topic:"education"
      })
    })

    onSendMessage(text,ques);
    setText("");
  };

  // auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEvaluate= async (chatidx:number, msgId: string)=>{

    setEvaluatingMessageIds((prev) => {
      if (prev.includes(msgId)) return prev;
      return [...prev, msgId];
    })

    if(!onEvaluate){
      return
    }

    let qus = ""

    for(let i =chatidx;i>=0;i--){
      if(messages[i].isSelf){
        qus = messages[i].message
        break
      }
    }

    onEvaluate(qus,messages[chatidx].message,chatidx)
  }

  return (
    <Card className="h-full flex flex-col ">
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-base">
          {title ?? "Interview Chat"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-y-auto">
          <ScrollArea className="md:h-full px-5 py-3 space-y-2">
            {messages.map((msg,idx) => {
              if (msg.isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="text-xs text-muted-foreground text-center"
                  >
                    {msg.message}
                  </div>
                );
              }
              const isSent = msg.isSelf
              return (
                <div
  key={msg.id}
  className={cn(
    "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
    isSent ? "flex-row-reverse" : "flex-row"
  )}
>
  <div
    className={cn(
      "flex flex-col max-w-[70%]",
      isSent ? "items-end" : "items-start"
    )}
  >
    {/* ชื่อคนส่ง */}
    <span className="text-xs font-medium text-foreground mb-1 px-1">
      {msg.username}
    </span>

    {/* กล่องข้อความหลัก */}
    <div
      className={cn(
        "rounded-2xl px-4 py-2.5 shadow-sm",
        isSent
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-muted text-foreground rounded-tl-sm border border-border"
      )}
    >
      <p className="text-sm leading-relaxed break-words max-w-50 md:max-w-100 whitespace-pre-wrap overflow-wrap-anywhere">
        {msg.message}
      </p>

      {/* ==== ส่วน Evaluate / ผลประเมิน อยู่ในกล่องเดียวกัน ==== */}

      {/* ถ้ายังไม่ประเมิน & ไม่ใช่ข้อความของตัวเอง & มี onEvaluate */}
      {onEvaluate && !msg.isSelf && !msg.isEvaluate && (
        <div className="mt-2 flex justify-start">
          {(() => {
      const isEvaluating = evaluatingMessageIds.includes(msg.id);

      return (
        <Button
          variant="ghost"
          size="sm"
          disabled={isEvaluating}
          className={cn(
            "group h-7 px-3 text-[11px] gap-1.5 rounded-full border shadow-sm transition-all duration-150",
            "bg-primary/5 text-primary border-primary/50 hover:bg-primary/10 hover:border-primary hover:shadow-md active:scale-95",
            isEvaluating && "opacity-70 cursor-not-allowed active:scale-100"
          )}
          onClick={() => handleEvaluate(idx, msg.id)}
        >
          {isEvaluating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 transition-transform duration-150 group-hover:scale-110 group-hover:rotate-12" />
          )}
          <span className="font-medium">
            {isEvaluating ? "Evaluating..." : "Evaluate answer"}
          </span>
        </Button>
      );
    })()}

        </div>
      )}

      {/* ถ้ามีผลการประเมินแล้ว */}
      {msg.isEvaluate && (
        <div className="mt-2 rounded-xl border border-border/70 bg-background/70 px-3 py-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-semibold text-foreground">
                Evaluation
              </span>
            </div>

            {/* ค่าเฉลี่ยรวม */}
            {(() => {
              const e = msg.isEvaluate;
              const avg =
                (e.accuracy + e.depth + e.attitude + e.relevance) / 4;
              const avgColor =
    avg >= 4
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : avg >= 2
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-red-100 text-red-800 border-red-200";

  return (
    <span
      className={cn(
        "text-[11px] px-2 py-0.5 rounded-full font-medium border",
        avgColor
      )}
    >
      Avg {avg.toFixed(1)}/5
    </span>
              );
            })()}
          </div>

          {/* แถวคะแนนย่อย 4 ด้าน */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            <EvalBadge label="Accuracy" value={msg.isEvaluate.accuracy} />
            <EvalBadge label="Depth" value={msg.isEvaluate.depth} />
            <EvalBadge label="Attitude" value={msg.isEvaluate.attitude} />
            <EvalBadge label="Relevance" value={msg.isEvaluate.relevance} />
          </div>
        </div>
      )}
    </div>
  </div>
</div>
              );
            })}
            <div ref={bottomRef} />
          </ScrollArea>
      </CardContent>
      <CardFooter className="border-t px-3 py-2">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2"
        >
          <Input
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-sm flex-1"
          />
          <Button type="submit" size="sm">
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
