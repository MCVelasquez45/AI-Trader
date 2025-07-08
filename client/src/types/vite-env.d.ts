/// <reference types="vite/client" />

// ✅ Extend Vite's built-in types without redeclaring DEV/PROD/MODE
interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_API_BASE?: string;
  // Add other VITE_ variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
