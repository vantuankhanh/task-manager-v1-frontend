/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;

  readonly VITE_API_USER: string;

  readonly VITE_API_PROJECT: string;

  readonly VITE_API_TASK: string;

  readonly VITE_API_GET_TASK_BY_PROJECT: string;
  readonly VITE_API_GET_TASK_BY_USER: string;
  readonly VITE_API_GET_PROJECT_BY_USER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
