import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportForm, type ReportInput } from "@/components/ReportForm";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/updates/$id")({ component: EditUpdate });

function EditUpdate() {
  const { id } = Route.useParams();
  const { user, profileName, loading } = useAuth();
  const nav = useNavigate();
  const [initial, setInitial] = useState<ReportInput | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("daily_reports").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) return toast.error(error.message);
      if (!data) { toast.error("Not found"); nav({ to: "/" }); return; }
      setInitial({
        report_date: data.report_date,
        todays_work: data.todays_work,
        pending_work: data.pending_work ?? "",
        tomorrow_plan: data.tomorrow_plan ?? "",
        status: data.status,
      });
    });
  }, [user, id, nav]);

  async function submit(d: ReportInput) {
    setBusy(true);
    const { error } = await supabase.from("daily_reports").update(d).eq("id", id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Update saved");
    nav({ to: "/" });
  }

  if (!user || !initial) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to dashboard</Link>
        </Button>
        <Card>
          <CardHeader><CardTitle>Edit Daily Update</CardTitle></CardHeader>
          <CardContent>
            <ReportForm initial={initial} employeeName={profileName ?? user.email!} submitting={busy} submitLabel="Save Changes" onSubmit={submit} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
