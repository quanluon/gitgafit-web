/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_DEFAULT_LANGUAGE?: string;
  readonly VITE_DEFAULT_THEME?: string;
  readonly VITE_ENABLE_OFFLINE_MODE?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

