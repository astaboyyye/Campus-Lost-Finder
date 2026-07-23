import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="liquid-canvas min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="relative flex flex-1 flex-col">
        <div aria-hidden="true" className="liquid-orb pointer-events-none -left-32 top-24 h-72 w-72 bg-cyan-300/25" />
        <div aria-hidden="true" className="liquid-orb pointer-events-none -right-32 top-[34rem] h-80 w-80 bg-violet-300/20 [animation-delay:-5s]" />
        {children}
      </main>
      <footer className="mt-auto border-t border-white/40 bg-background/55 py-8 backdrop-blur-xl dark:border-white/10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>CampusFound &copy; {new Date().getFullYear()}. Helping the UTP community reunite with their belongings.</p>
        </div>
      </footer>
    </div>
  );
}
