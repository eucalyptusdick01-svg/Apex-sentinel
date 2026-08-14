import { useState } from "react";
import { useAuthLogin, getAuthMeQueryKey } from "@workspace/api-client-react";
import { useLocation, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const search = useSearch();
  const queryClient = useQueryClient();
  const login = useAuthLogin();

  const redirectTo = new URLSearchParams(search).get("redirect") ?? "/dashboard";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { data: { email, password } },
      {
        onSuccess: (user) => {
          queryClient.setQueryData(getAuthMeQueryKey(), user);
          navigate(redirectTo);
        },
      },
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground font-mono items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="border border-primary/30 bg-card p-6 shadow-[0_0_30px_rgba(0,204,255,0.1)]">
          <h1 className="text-xl font-bold tracking-[0.15em] text-primary drop-shadow-[0_0_8px_rgba(0,204,255,0.5)] uppercase mb-1">
            S W E P T - S E N T I N E L
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest mb-6">AUTHENTICATION REQUIRED</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-primary tracking-widest">[EMAIL] &gt;</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-primary/30 text-foreground font-mono rounded-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                placeholder="operator@domain.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-primary tracking-widest">[PASSWORD] &gt;</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-primary/30 text-foreground font-mono rounded-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {login.error && (
              <div className="text-xs text-red-400 tracking-wider border border-red-500/30 bg-red-950/20 px-3 py-2">
                [ERROR] {(login.error as { error?: string })?.error ?? "Authentication failed"}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="mt-2 h-10 bg-primary/10 border border-primary/50 text-primary text-sm tracking-widest hover:bg-primary/20 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {login.isPending ? "AUTHENTICATING..." : "[ AUTHENTICATE ]"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <span className="text-xs text-muted-foreground tracking-wider">NO ACCOUNT? </span>
            <button
              onClick={() => navigate("/register")}
              className="text-xs text-primary hover:underline tracking-wider"
            >
              REGISTER ACCESS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
