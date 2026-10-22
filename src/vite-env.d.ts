/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH: string;
  readonly VITE_SERVER_URL: string;
  readonly VITE_ASSET_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_API_NETWORK_MONITORING_URL: string;
  readonly VITE_WS_NETWORK_MONITORING_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_INVOICE_URL: string;
  readonly VITE_PAYMENT_URL: string;
  readonly VITE_EXCEL_URL: string;
  readonly VITE_SOCKET_DOMAIN: string;
  readonly VITE_MAPBOX_API_KEY: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APPID: string;
  readonly VITE_AWS_AMPLIFY_USER_POOL_ID: string;
  readonly VITE_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID: string;
  readonly VITE_AWS_AMPLIFY_REGION: string;
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_CALLBACK_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_WHATSAPP_PANEL_DOMAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
