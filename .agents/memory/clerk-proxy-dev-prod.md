---
  name: Clerk dev vs prod proxy
  description: proxyUrl in ClerkProvider must be conditionally set — only in production builds
  ---

  In `App.tsx`, set `proxyUrl` only when `import.meta.env.PROD` is true:

  ```ts
  const clerkProxyUrl = import.meta.env.PROD
    ? window.location.origin + "/api/__clerk"
    : undefined;
  ```

  **Why:** The clerkProxyMiddleware in the API server calls `next()` in development (NODE_ENV !== 'production'). If proxyUrl is set in dev, Clerk tries to load clerk.browser.js through `/api/__clerk/npm/...` which returns 404 and breaks auth entirely.

  **How to apply:** Always gate proxyUrl on `import.meta.env.PROD`. The CLERK_PROXY_PATH constant in clerkProxyMiddleware.ts is `/api/__clerk`.
  