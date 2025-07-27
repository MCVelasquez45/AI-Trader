/// <reference types="vite/client" />

// ✅ Extend Vite's built-in environment variable interface
interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_API_BASE?: string;       // Optional API base if used
  readonly VITE_BACKEND_URL: string;     // 🔐 Required: backend server URL for Auth/Login (e.g., http://localhost:4545)
  // Add other VITE_ variables here as needed
}

// ✅ Declare ImportMeta to use with import.meta.env
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ✅ Extend window to include Bootstrap tooltip/popover (optional)
interface Bootstrap {
  Tooltip: new (element: Element, options?: any) => any;
  Popover: new (element: Element, options?: any) => any;
}

interface Window {
  bootstrap: Bootstrap;
}