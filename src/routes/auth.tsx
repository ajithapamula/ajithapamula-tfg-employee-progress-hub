import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, ShieldCheck, Sparkles } from "lucide-react";
import tfgLogo from "@/assets/tfg-logo.jpeg";

export const Route = createFileRoute("/auth")({ component: Auth });

function Auth() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);

  const [li, setLi] = useState({ email: "", password: "" });
  const [su, setSu] = useState({ name: "", email: "", password: "", role: "employee" });

  useEffect(() => {
    if (!loading && user) nav({ to: "/" });
  }, [loading, user, nav]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(li);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    nav({ to: "/" });
  }

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    if (su.password.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: su.email,
      password: su.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name: su.name, role: su.role },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    nav({ to: "/" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-secondary/40">
      {/* decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-info/20 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Left: brand panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-primary/5 via-transparent to-info/10 border-r border-border">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-xl bg-white shadow-sm ring-1 ring-border grid place-items-center overflow-hidden">
              <img src={tfgLogo} alt="TFG logo" className="h-10 w-10 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-xl tracking-tight">TFG</div>
              <div className="text-xs text-muted-foreground">AI Powered IT Solutions</div>
            </div>
          </Link>

          <div className="space-y-6 max-w-md">
            <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              Track every day.<br />
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">Move faster together.</span>
            </h1>
            <p className="text-muted-foreground text-base xl:text-lg">
              DailyTrack helps your team capture daily progress, surface blockers, and keep managers in the loop — without the meeting overload.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-primary" /> Daily status updates in seconds</li>
              <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Role-based access for managers & employees</li>
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> Clear visibility across teams</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TFG · AI Powered IT Solutions</p>
        </div>

        {/* Right: auth card */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <Link to="/" className="lg:hidden flex items-center gap-3 justify-center mb-8">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm ring-1 ring-border grid place-items-center overflow-hidden">
                <img src={tfgLogo} alt="TFG logo" className="h-12 w-12 object-contain" />
              </div>
              <div className="leading-tight">
                <div className="font-display font-bold text-xl">TFG</div>
                <div className="text-xs text-muted-foreground">AI Powered IT Solutions</div>
              </div>
            </Link>

            <Card className="border-border/60 shadow-xl shadow-primary/5 backdrop-blur-sm">
              <CardHeader className="space-y-1.5">
                <CardTitle className="font-display text-2xl">Welcome to DailyTrack</CardTitle>
                <CardDescription>Sign in or create an account to continue.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={login} className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="le">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="le" type="email" required placeholder="you@company.com" className="pl-9"
                            value={li.email} onChange={(e) => setLi({ ...li, email: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lp">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="lp" type={showLoginPw ? "text" : "password"} required placeholder="••••••••" className="pl-9 pr-9"
                            value={li.password} onChange={(e) => setLi({ ...li, password: e.target.value })} />
                          <button type="button" onClick={() => setShowLoginPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showLoginPw ? "Hide password" : "Show password"}>
                            {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={busy}>
                        {busy ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</>) : "Sign in"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={signup} className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="sn">Full name</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="sn" required maxLength={80} placeholder="Jane Doe" className="pl-9"
                            value={su.name} onChange={(e) => setSu({ ...su, name: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="se">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="se" type="email" required placeholder="you@company.com" className="pl-9"
                            value={su.email} onChange={(e) => setSu({ ...su, email: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sp">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="sp" type={showSignupPw ? "text" : "password"} required minLength={6}
                            placeholder="At least 6 characters" className="pl-9 pr-9"
                            value={su.password} onChange={(e) => setSu({ ...su, password: e.target.value })} />
                          <button type="button" onClick={() => setShowSignupPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showSignupPw ? "Hide password" : "Show password"}>
                            {showSignupPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={su.role} onValueChange={(v) => setSu({ ...su, role: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="manager">Manager / Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={busy}>
                        {busy ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</>) : "Create account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  By continuing, you agree to TFG's terms and privacy policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
