import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import Pricing from "@/pages/Pricing";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import DirectBuy from "@/pages/DirectBuy";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import { useEffect } from "react";
import { ProtectedRoute, ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin">
        <ProtectedAdminRoute component={Admin} />
      </Route>
      <Route path="/pricing" component={Pricing} />
      <Route path="/buy/:interval" component={DirectBuy} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/" component={Landing} />
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
