import type { Socket } from 'socket.io-client';
import type {
  WhatsAppChannel,
  LoginWaitResponse,
  LoginStartResponse,
  CreateChannelResponse,
  OpenclawGatewayStatus,
} from 'src/repositories/openclaw';

// Domain types re-exported for the UI layer
export type {
  WhatsAppChannel,
  LoginWaitResponse,
  LoginStartResponse,
  CreateChannelResponse,
  OpenclawGatewayStatus,
};

/** A raw openclaw.json configuration object */
export type OpenclawConfig = Record<string, any>;

/** Openclaw admin page active tab */
export type OpenclawTabValue = 'soul' | 'channels' | 'configuration';

/** Payload used when creating a new WhatsApp channel */
export type AddChannelPayload = {
  workspace: string;
  channelName?: string;
};

// ---- Hooks ----

export type UseChannelsReturn = {
  channels: WhatsAppChannel[];
  loading: boolean;
  error: string | null;
  fetchChannels: () => Promise<void>;
  addChannel: (payload: AddChannelPayload) => Promise<void>;
  deleteChannel: (id: string) => Promise<void>;
  logoutChannel: (id: string) => Promise<void>;
  startLogin: (payload: { id: string; force?: boolean; timeoutMs?: number }) => Promise<LoginStartResponse>;
  waitLogin: (payload: { id: string; currentQrDataUrl?: string; timeoutMs?: number }) => Promise<LoginWaitResponse>;
};

export type UseSoulReturn = {
  content: string;
  loading: boolean;
  error: string | null;
  fetchSoul: () => Promise<void>;
  updateSoul: (content: string) => Promise<void>;
};

export type UseOpenclawGatewayReturn = {
  running: boolean;
  loading: boolean;
  error: string | null;
  checkGateway: () => Promise<boolean>;
  startGateway: () => Promise<void>;
  stopGateway: () => Promise<void>;
};

// ---- Component props ----

export type GatewayStatusButtonProps = {
  running?: boolean;
  loading?: boolean;
  error?: string | null;
  onRestart?: () => void;
  onStop?: () => void;
};

export type ChannelTableProps = {
  channels: WhatsAppChannel[];
  loginChannelId?: string | null;
  polling?: boolean;
  onLogin: (id: string) => void;
  onLogout: (id: string) => void;
  onDelete: (id: string) => void;
};

export type AddChannelDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (payload: AddChannelPayload) => void | Promise<void>;
};

export type QrLoginDialogProps = {
  loginChannelId: string | null;
  qrDataUrl: string | null;
  polling: boolean;
  onClose: () => void;
};

export type QRCodeDisplayProps = {
  qrDataUrl: string;
};

export type SoulEditTabProps = {
  loading: boolean;
  content: string;
  onChange: (value: string) => void;
};

export type SoulPreviewTabProps = {
  loading: boolean;
  content: string;
};

export type SoulSaveButtonProps = {
  content: string;
  editContent: string;
  onSave: (content: string) => Promise<void>;
};

/** Minimal shape of the socket store used by the channel login flow */
export type SocketStoreShape = {
  isConnected: boolean;
  client: Socket | null;
  connect: () => void;
  disconnect: () => void;
};
