// ❌ ตรงนี้ "ห้าม" ใส่ "use client"
import InterviewPage from "./component/InterviewPage";

export default async function Page({
  params,
}: {
  params: Promise<{ room: string }>;
}) {

  const { room } = await params;

  return <InterviewPage room={room} />;
}