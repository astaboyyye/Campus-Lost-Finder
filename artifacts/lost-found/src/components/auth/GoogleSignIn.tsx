import { useState } from "react";
import { useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

type OAuthProvider = "google" | "microsoft";

export function GoogleSignIn() {
  const clerk = useClerk();
  const [error, setError] = useState<string | null>(null);
  const [redirectingProvider, setRedirectingProvider] = useState<OAuthProvider | null>(null);

  const startOAuthSignIn = async (provider: OAuthProvider) => {
    setError(null);
    setRedirectingProvider(provider);

    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: provider === "google" ? "oauth_google" : "oauth_microsoft",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/browse`,
      });
    } catch (cause) {
      console.error(`${provider} sign-in failed`, cause);
      setError(`${provider === "google" ? "Google" : "Microsoft"} sign-in could not be started. Confirm the connection is enabled in Clerk.`);
      setRedirectingProvider(null);
    }
  };

  return (
    <main className="liquid-canvas relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden="true" className="liquid-orb -left-24 top-12 h-80 w-80 bg-cyan-300/35" />
      <div aria-hidden="true" className="liquid-orb -right-20 bottom-10 h-96 w-96 bg-violet-300/30 [animation-delay:-5s]" />
      <section className="liquid-glass w-full max-w-md rounded-[2rem] border-0 p-8 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-cyan-400 text-white shadow-xl shadow-primary/20">
            <MapPin className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign in to CampusFound</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose your campus account to continue securely.</p>
        </div>

        <div className="space-y-3">
          <Button className="h-12 w-full justify-start gap-3 px-5 text-base" variant="outline" onClick={() => startOAuthSignIn("google")} disabled={redirectingProvider !== null}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z" />
              <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
              <path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.55l3.35-2.62Z" />
              <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
            </svg>
            {redirectingProvider === "google" ? "Redirecting…" : "Continue with Google"}
          </Button>

          <Button className="h-12 w-full justify-start gap-3 px-5 text-base" variant="outline" onClick={() => startOAuthSignIn("microsoft")} disabled={redirectingProvider !== null}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#F25022" d="M2 2h9.5v9.5H2z" /><path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
              <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" /><path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
            </svg>
            {redirectingProvider === "microsoft" ? "Redirecting…" : "Continue with Microsoft"}
          </Button>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">By continuing, you agree to use CampusFound responsibly and protect the privacy of other students.</p>
      </section>
    </main>
  );
}
