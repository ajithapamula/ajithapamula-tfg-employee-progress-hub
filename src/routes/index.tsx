import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type ReportStatus } from "@/components/StatusBadge";
import { Plus, Pencil, Trash2, CalendarDays, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/")({ component: Home });

interface Report {
  id: string;
  report_date: string;
  todays_work: string;
  pending_work: string | null;
  tomorrow_plan: string | null;
  status: ReportStatus;
  created_at: string;
}

function Home() {
  const { user, loading, profileName, role } = useAuth();
  const nav = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    setBusy(true);
    const { data, error } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", user!.id)
      .order("report_date", { ascending: false });
    if (error) toast.error(error.message);
    setReports((data ?? []) as Report[]);
    setBusy(false);
  }

  async function remove(id: string) {
    const { error } = await supabase.from("daily_reports").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Update deleted");
    setReports((r) => r.filter((x) => x.id !== id));
  }

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  const stats = {
    total: reports.length,
    completed: reports.filter((r) => r.status === "completed").length,
    in_progress: reports.filter((r) => r.status === "in_progress").length,
    pending: reports.filter((r) => r.status === "pending").length,
  };

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profileName?.split(" ")[0] ?? "there"}</h1>
            <p className="text-muted-foreground mt-1">Here's a snapshot of your daily work.</p>
          </div>
          <Button asChild size="lg">
            <Link to="/updates/new"><Plus className="h-4 w-4 mr-2" />Add Daily Update</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Total updates" value={stats.total} tone="primary" />
          <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={stats.completed} tone="success" />
          <StatCard icon={<Clock className="h-5 w-5" />} label="In Progress" value={stats.in_progress} tone="info" />
          <StatCard icon={<AlertCircle className="h-5 w-5" />} label="Pending" value={stats.pending} tone="warning" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Previous Updates</CardTitle>
            {role === "manager" && (
              <Button asChild variant="outline" size="sm"><Link to="/manager">View team reports</Link></Button>
            )}
          </CardHeader>
          <CardContent>
            {busy ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
            ) : reports.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No updates yet. Submit your first daily report!</p>
                <Button asChild><Link to="/updates/new"><Plus className="h-4 w-4 mr-2" />Add update</Link></Button>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="rounded-xl border p-4 hover:border-primary/40 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{new Date(r.report_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="flex gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link to="/updates/$id" params={{ id: r.id }}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this update?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove(r.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <Field label="Today's Work" value={r.todays_work} />
                      <Field label="Pending" value={r.pending_work} />
                      <Field label="Tomorrow" value={r.tomorrow_plan} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className="whitespace-pre-wrap text-foreground/90">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "primary" | "success" | "info" | "warning" }) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    info: "bg-info/15 text-info",
    warning: "bg-warning/20 text-warning-foreground",
  }[tone];
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`h-11 w-11 rounded-xl grid place-items-center ${toneClass}`}>{icon}</div>
        <div>
          <div className="text-2xl font-bold leading-none">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
