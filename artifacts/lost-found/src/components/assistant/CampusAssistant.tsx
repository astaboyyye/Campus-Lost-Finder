import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useAuth } from "@clerk/react";
import { LoaderCircle, Send, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I’m Asta! I can help you search CampusFound reports or explain how reporting and claims work at UTP. What are you looking for?",
};

export function CampusAssistant() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isSending]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const content = input.trim();
    if (!content || isSending || !isSignedIn) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const token = await getToken();
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: nextMessages.slice(-20).map(({ role, content: text }) => ({
            role,
            content: text,
          })),
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      if (!response.ok || !data.message) {
        throw new Error(data.error || "The assistant could not reply.");
      }
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: data.message! },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The assistant could not reply.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <aside
      className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
      aria-label="Asta AI assistant"
    >
      {isOpen && (
        <section
          className="liquid-glass mb-3 flex h-[min(650px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-[1.75rem] shadow-2xl"
          role="dialog"
          aria-modal="false"
          aria-labelledby="asta-assistant-title"
        >
          <header className="flex items-center gap-3 border-b border-border/60 bg-background/45 px-4 py-3.5">
            <span className="size-10 overflow-hidden rounded-full border border-white/40 bg-background shadow-lg shadow-primary/20">
              <img
                src="/background/asta.png"
                alt=""
                className="size-full object-cover"
              />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                id="asta-assistant-title"
                className="font-semibold tracking-tight"
              >
                Asta
              </h2>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="size-1.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                Powered by OpenRouter
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close Asta"
            >
              <X aria-hidden="true" />
            </Button>
          </header>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-3 p-4" aria-live="polite">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    message.role === "user"
                      ? "ml-auto rounded-br-md bg-primary text-primary-foreground shadow-md shadow-primary/15"
                      : "rounded-bl-md border border-border/70 bg-background/75 text-foreground",
                  )}
                >
                  {message.content}
                </div>
              ))}
              {isSending && (
                <div className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-md border border-border/70 bg-background/75 px-3.5 py-2.5 text-sm text-muted-foreground">
                  <LoaderCircle
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  Checking CampusFound…
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-border/60 bg-background/45 p-3">
            {!isLoaded ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                Loading assistant…
              </p>
            ) : !isSignedIn ? (
              <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-center">
                <p className="mb-2 text-sm text-muted-foreground">
                  Sign in to chat securely.
                </p>
                <Button asChild size="sm">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={sendMessage} className="space-y-2">
                {error && (
                  <p
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <div className="flex items-end gap-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value.slice(0, 1_000))
                    }
                    onKeyDown={handleInputKeyDown}
                    placeholder="Ask about a lost or found item…"
                    rows={1}
                    aria-label="Message Asta"
                    className="max-h-28 min-h-11 resize-none rounded-2xl bg-background/80"
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="size-11 shrink-0 rounded-2xl"
                    disabled={!input.trim() || isSending}
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <LoaderCircle
                        className="animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                    ) : (
                      <Send aria-hidden="true" />
                    )}
                  </Button>
                </div>
                <p className="px-1 text-[11px] text-muted-foreground">
                  AI can make mistakes. Verify report details before claiming.
                </p>
              </form>
            )}
          </div>
        </section>
      )}

      <Button
        size="lg"
        className="ml-auto size-14 rounded-full p-0 shadow-xl shadow-primary/25"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close Asta" : "Open Asta"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <img
            src="/background/asta.png"
            alt=""
            className="size-full rounded-full object-cover"
          />
        )}
      </Button>
    </aside>
  );
}
