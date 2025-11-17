import { cn } from "@/lib/utils";

type EvalBadgeProps = {
  label: string;
  value: number;
};

export function EvalBadge({ label, value }: EvalBadgeProps) {
  let colorClass =
    "bg-red-100 text-red-800 border-red-200"; // default แย่

  if (value >= 4) {
    colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
  } else if (value >= 2) {
    colorClass = "bg-amber-100 text-amber-800 border-amber-200";
  }

  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span
        className={cn(
          "px-2 py-0.5 rounded-full border text-[11px] font-medium",
          colorClass
        )}
      >
        {value}/5
      </span>
    </div>
  );
}