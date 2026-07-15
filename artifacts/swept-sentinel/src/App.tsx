import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import { useEffect } from "react";
import { useAuthMe } from "@workspace/api-client-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
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

function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
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
  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin">
        <ProtectedAdminRoute component={Admin} />
      </Route>
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
