import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReportStatus } from "./StatusBadge";

export interface ReportInput {
  report_date: string;
  todays_work: string;
  pending_work: string;
  tomorrow_plan: string;
  status: ReportStatus;
}

export function ReportForm({
  initial,
  employeeName,
  onSubmit,
  submitting,
  submitLabel = "Save Update",
}: {
  initial?: Partial<ReportInput>;
  employeeName: string;
  onSubmit: (data: ReportInput) => void | Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
}) {
  const [data, setData] = useState<ReportInput>({
    report_date: initial?.report_date ?? new Date().toISOString().slice(0, 10),
    todays_work: initial?.todays_work ?? "",
    pending_work: initial?.pending_work ?? "",
    tomorrow_plan: initial?.tomorrow_plan ?? "",
    status: (initial?.status as ReportStatus) ?? "in_progress",
  });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.todays_work.trim()) { setError("Today's work is required"); return; }
    if (data.todays_work.length > 5000) { setError("Today's work too long"); return; }
    setError("");
    onSubmit({
      ...data,
      todays_work: data.todays_work.trim(),
      pending_work: data.pending_work.trim(),
      tomorrow_plan: data.tomorrow_plan.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={data.report_date}
            onChange={(e) => setData({ ...data, report_date: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Employee Name</Label>
          <Input value={employeeName} disabled />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="today">Today's Work *</Label>
        <Textarea id="today" rows={4} placeholder="- Created login API&#10;- Fixed dashboard UI"
          value={data.todays_work} onChange={(e) => setData({ ...data, todays_work: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pending">Pending Work</Label>
        <Textarea id="pending" rows={3} placeholder="- Need to test API"
          value={data.pending_work} onChange={(e) => setData({ ...data, pending_work: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan">Tomorrow's Plan</Label>
        <Textarea id="plan" rows={3} placeholder="- Complete API testing"
          value={data.tomorrow_plan} onChange={(e) => setData({ ...data, tomorrow_plan: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v as ReportStatus })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
