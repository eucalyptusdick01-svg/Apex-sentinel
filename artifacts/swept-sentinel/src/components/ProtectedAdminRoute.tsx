import { Redirect } from "wouter";
import { useAuthMe } from "@workspace/api-client-react";

export function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading, error } = useAuthMe();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-primary/60 font-mono text-xs tracking-wider animate-pulse">
        [INITIALIZING...]
      </div>
    );
  }
  if (!user || error) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

export function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading, error } = useAuthMe();

  if (isLoading) {
    return (
      <div data-testid="loading" className="flex h-screen items-center justify-center bg-background text-primary/60 font-mono text-xs tracking-wider animate-pulse">
        [INITIALIZING...]
      </div>
    );
  }
  if (!user || error) {
    return <Redirect to="/login" />;
  }
  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }
  return <Component />;
}
