"use client";

import { createContext, useContext, useState } from "react";

interface FollowUpItem {
  text: string;
}

type FollowUp = FollowUpItem[]

interface FollowUpsContextType {
  followUpQueue: FollowUp;
  setFollowUpQueue: React.Dispatch<
    React.SetStateAction<FollowUp>
  >;
}

const FollowUpsContext = createContext<FollowUpsContextType | null>(null);

export const FollowUpsProvider = ({ children }: { children: React.ReactNode }) => {
  const [followUpQueue, setFollowUpQueue] = useState<FollowUpItem[]>([]);

  return (
    <FollowUpsContext.Provider value={{ followUpQueue, setFollowUpQueue }}>
      {children}
    </FollowUpsContext.Provider>
  );
};

export const useFollowUps = () => {
  const ctx = useContext(FollowUpsContext);
  if (!ctx) throw new Error("useQuestions must be used inside FollowUpsProvider");
  return ctx;
};
