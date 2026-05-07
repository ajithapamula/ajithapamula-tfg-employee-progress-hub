import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, ClipboardList, Users } from "lucide-react";
import logo from "@/assets/tfg-logo.jpeg";

export function AppNav() {
  const { user, role, profileName, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="TFG - AI Powered IT Solutions" className="h-10 w-10 rounded-lg object-contain bg-white" />
          <span className="font-display font-semibold text-lg hidden sm:inline">TFG DailyTrack</span>
        </Link>
        {user && (
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/"><ClipboardList className="h-4 w-4 mr-2" />My Updates</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/manager"><Users className="h-4 w-4 mr-2" />Team Reports</Link>
            </Button>
            <div className="hidden sm:flex items-center gap-2 ml-3 px-3 py-1.5 rounded-full bg-secondary text-xs">
              <span className="font-medium">{profileName ?? user.email}</span>
              <span className="text-muted-foreground capitalize">· {role}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); nav({ to: "/auth" }); }} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
