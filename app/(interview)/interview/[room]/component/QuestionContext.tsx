"use client";

import { createContext, useContext, useState } from "react";

type TopicKey = "skills" | "education" | "experience";

interface BackendQuestion {
  id: number;
  question: string;
  answer: string | null;
  difficulty: "easy" | "medium" | "hard";
  followUpTopics: string[];
}

interface QuestionWithSelect extends BackendQuestion {
  isSelect: boolean;
}

type QuestionsByTopic = Record<TopicKey, QuestionWithSelect[]>;

interface QuestionsContextType {
  questionsByTopic: QuestionsByTopic;
  setQuestionsByTopic: React.Dispatch<
    React.SetStateAction<QuestionsByTopic>
  >;
}

const QuestionsContext = createContext<QuestionsContextType | null>(null);

export const QuestionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [questionsByTopic, setQuestionsByTopic] = useState<QuestionsByTopic>({
    skills: [],
    education: [],
    experience: [],
  });

  return (
    <QuestionsContext.Provider value={{ questionsByTopic, setQuestionsByTopic }}>
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => {
  const ctx = useContext(QuestionsContext);
  if (!ctx) throw new Error("useQuestions must be used inside QuestionsProvider");
  return ctx;
};
