import { ClerkProvider } from "@clerk/react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    afterSignOutUrl="/"
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
  >
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </ClerkProvider>,
);
