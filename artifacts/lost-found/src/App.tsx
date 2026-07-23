import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

import Home from "@/pages/home";
import BrowseItems from "@/pages/browse";
import ItemDetail from "@/pages/item-detail";
import ReportItem from "@/pages/report";
import MyItems from "@/pages/my-items";
import MyClaims from "@/pages/my-claims";
import Profile from "@/pages/profile";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";
import { CampusAssistant } from "@/components/assistant/CampusAssistant";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ClerkAuthSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);
  return null;
}

function SignInPage() {
  return <GoogleSignIn />;
}

function SsoCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={BrowseItems} />
      <Route path="/items/:id" component={ItemDetail} />
      <Route path="/report" component={ReportItem} />
      <Route path="/my-items" component={MyItems} />
      <Route path="/my-claims" component={MyClaims} />
      <Route path="/profile" component={Profile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin/users" component={Dashboard} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignInPage} />
      <Route path="/sso-callback" component={SsoCallbackPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkAuthSync />
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <Router />
          <CampusAssistant />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
