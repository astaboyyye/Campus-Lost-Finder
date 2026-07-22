import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-2" title={`Switch to ${isDark ? "light" : "dark"} mode`}>
      <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      />
      <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}
