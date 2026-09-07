/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** App display name (tab title, sidebar logo, page titles). */
  readonly VITE_APP_NAME?: string;
  /** Base URL of the backend API, e.g. http://localhost:8000/api */
  readonly VITE_API_BASE_URL?: string;
  /** Axios request timeout in milliseconds. */
  readonly VITE_REQUEST_TIMEOUT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
