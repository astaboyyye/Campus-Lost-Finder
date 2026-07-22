import { useState } from "react";
import { useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export function GoogleSignIn() {
  const clerk = useClerk();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const startGoogleSignIn = async () => {
    setError(null);
    setIsRedirecting(true);

    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/browse`,
      });
    } catch (cause) {
      console.error("Google sign-in failed", cause);
      setError(
        "Google sign-in is not available yet. Ask an administrator to enable the Google provider.",
      );
      setIsRedirecting(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-4">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl shadow-primary/5">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MapPin className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Sign in to CampusFound</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue securely with your Google account.
          </p>
        </div>

        <Button
          className="h-12 w-full gap-3 text-base"
          variant="outline"
          onClick={startGoogleSignIn}
          disabled={isRedirecting}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.55l3.35-2.62Z" />
            <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
          </svg>
          {isRedirecting ? "Redirecting…" : "Continue with Google"}
        </Button>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
