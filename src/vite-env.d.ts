/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LAMBDA_FUNCTION_URL: string
  readonly VITE_DYNAMODB_LAMBDA_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
