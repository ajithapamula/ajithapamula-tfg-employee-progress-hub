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

export const Route = createFileRoute("/updates/new")({ component: NewUpdate });

function NewUpdate() {
  const { user, profileName, loading } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);

  async function submit(d: ReportInput) {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("daily_reports").insert({ ...d, user_id: user.id });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Daily update added");
    nav({ to: "/" });
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to dashboard</Link>
        </Button>
        <Card>
          <CardHeader><CardTitle>Add Daily Update</CardTitle></CardHeader>
          <CardContent>
            <ReportForm employeeName={profileName ?? user.email!} submitting={busy} onSubmit={submit} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
