---
  name: App.tsx scaffold cleanup after design subagent
  description: Design subagent imports page components but scaffold placeholder functions remain, causing duplicate identifier errors
  ---

  After the design subagent adds page imports to App.tsx (e.g., `import Home from "@/pages/home"`), the original scaffold placeholder function (e.g., `function Home() { ... }`) remains in the file. This causes a Babel/Vite syntax error: "Identifier 'Home' has already been declared."

  **Why:** The scaffold template includes a placeholder Home component. The design subagent imports the real component but doesn't remove the placeholder.

  **How to apply:** After design subagent completes, scan App.tsx for any function declarations that duplicate imported component names and remove them.
  