/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  // füge weitere Umgebungsvariablen hinzu, wenn nötig
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 