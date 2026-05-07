import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, type ReportStatus } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/manager")({ component: Manager });

interface Row {
  id: string;
  report_date: string;
  todays_work: string;
  pending_work: string | null;
  tomorrow_plan: string | null;
  status: ReportStatus;
  user_id: string;
  name: string;
  email: string;
}

function Manager() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(true);
  const [empFilter, setEmpFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setBusy(true);
      const [{ data: reports, error }, { data: profiles }] = await Promise.all([
        supabase.from("daily_reports").select("*").order("report_date", { ascending: false }),
        supabase.from("profiles").select("id,name,email"),
      ]);
      if (error) toast.error(error.message);
      const map = new Map((profiles ?? []).map((p) => [p.id, p]));
      const merged: Row[] = (reports ?? []).map((r) => {
        const p = map.get(r.user_id);
        return { ...r, name: p?.name ?? "Unknown", email: p?.email ?? "" } as Row;
      });
      setRows(merged);
      setBusy(false);
    })();
  }, [user]);

  const employees = useMemo(() => {
    const m = new Map<string, string>();
    rows.forEach((r) => m.set(r.user_id, r.name));
    return Array.from(m.entries());
  }, [rows]);

  const filtered = rows.filter((r) => {
    if (empFilter !== "all" && r.user_id !== empFilter) return false;
    if (dateFilter && r.report_date !== dateFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !(r.name.toLowerCase().includes(search.toLowerCase()) || r.todays_work.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const stats = {
    total: filtered.length,
    completed: filtered.filter((r) => r.status === "completed").length,
    in_progress: filtered.filter((r) => r.status === "in_progress").length,
    pending: filtered.filter((r) => r.status === "pending").length,
  };

  function exportCSV() {
    const headers = ["Date", "Employee", "Email", "Today's Work", "Pending Work", "Tomorrow Plan", "Status"];
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [headers.join(",")];
    filtered.forEach((r) => {
      lines.push([r.report_date, r.name, r.email, r.todays_work, r.pending_work ?? "", r.tomorrow_plan ?? "", r.status].map((x) => escape(String(x))).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `reports-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Team Reports</h1>
          <p className="text-muted-foreground mt-1">All employee daily updates in one place.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat icon={<Users className="h-5 w-5" />} label="Total reports" value={stats.total} cls="bg-primary/10 text-primary" />
          <Stat icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={stats.completed} cls="bg-success/15 text-success" />
          <Stat icon={<Clock className="h-5 w-5" />} label="In Progress" value={stats.in_progress} cls="bg-info/15 text-info" />
          <Stat icon={<AlertCircle className="h-5 w-5" />} label="Pending" value={stats.pending} cls="bg-warning/20 text-warning-foreground" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-end gap-3 justify-between">
              <CardTitle>Reports</CardTitle>
              <button onClick={exportCSV} className="text-sm font-medium text-primary hover:underline">Export CSV</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
              <div>
                <Label className="text-xs">Employee</Label>
                <Select value={empFilter} onValueChange={setEmpFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All employees</SelectItem>
                    {employees.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Search</Label>
                <Input placeholder="Name or work..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Today's Work</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Tomorrow</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {busy ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No reports match your filters.</TableCell></TableRow>
                  ) : filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">{new Date(r.report_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap">{r.todays_work}</TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap text-muted-foreground">{r.pending_work || "—"}</TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap text-muted-foreground">{r.tomorrow_plan || "—"}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Stat({ icon, label, value, cls }: { icon: React.ReactNode; label: string; value: number; cls: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`h-11 w-11 rounded-xl grid place-items-center ${cls}`}>{icon}</div>
        <div>
          <div className="text-2xl font-bold leading-none">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
