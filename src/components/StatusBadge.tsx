import { cn } from "@/lib/utils";

export type ReportStatus = "completed" | "in_progress" | "pending";

const map: Record<ReportStatus, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "bg-success/15 text-success border-success/30" },
  in_progress: { label: "In Progress", cls: "bg-info/15 text-info border-info/30" },
  pending: { label: "Pending", cls: "bg-warning/20 text-warning-foreground border-warning/40" },
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", m.cls)}>
      {m.label}
    </span>
  );
}
