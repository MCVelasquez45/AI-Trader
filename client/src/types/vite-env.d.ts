/// <reference types="vite/client" />

// ✅ Extend Vite's built-in types without redeclaring DEV/PROD/MODE
interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_API_BASE?: string;
  // Add other VITE_ variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ✅ Extend window to include Bootstrap for tooltip support
interface Bootstrap {
  Tooltip: new (element: Element, options?: any) => any;
  Popover: new (element: Element, options?: any) => any;
  // Add more Bootstrap components as needed
}

interface Window {
  bootstrap: Bootstrap;
}
