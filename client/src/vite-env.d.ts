/// <reference types="vite/client" />

// ✅ Extend Vite's built-in environment variable interface
interface ImportMetaEnv extends Record<string, string | undefined> {
  readonly VITE_API_BASE?: string;       // Optional API base if used
  readonly VITE_BACKEND_URL: string;     // 🔐 Required: backend server URL for Auth/Login (e.g., http://localhost:4545)
  // Add other VITE_ variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ✅ Extend global types
declare global {
  interface Bootstrap {
    Tooltip: new (element: Element, options?: any) => any;
    Popover: new (element: Element, options?: any) => any;
  }

  interface Window {
    bootstrap: Bootstrap;
  }
}

export {};