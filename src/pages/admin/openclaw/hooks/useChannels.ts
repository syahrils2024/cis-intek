import type { WhatsAppChannel, LoginWaitResponse, LoginStartResponse } from 'src/repositories/openclaw';

import { useState } from 'react';

import * as openclawRepository from 'src/repositories/openclaw';

import type { AddChannelPayload, UseChannelsReturn } from '../openclaw.types';

export default function useChannels(): UseChannelsReturn {
  const [channels, setChannels] = useState<WhatsAppChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await openclawRepository.getWhatsAppChannels();
      setChannels(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch channels');
    } finally {
      setLoading(false);
    }
  };

  const addChannel = async (payload: AddChannelPayload) => {
    setLoading(true);
    setError(null);
    try {
      await openclawRepository.createWhatsAppChannel(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add channel');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteChannel = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await openclawRepository.deleteWhatsAppChannel(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete channel');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logoutChannel = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await openclawRepository.logoutWhatsAppChannel(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout channel');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startLogin = async (payload: {
    id: string;
    force?: boolean;
    timeoutMs?: number;
  }): Promise<LoginStartResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await openclawRepository.startWhatsAppLogin(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const waitLogin = async (payload: {
    id: string;
    currentQrDataUrl?: string;
    timeoutMs?: number;
  }): Promise<LoginWaitResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await openclawRepository.waitWhatsAppLogin(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login wait failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    channels,
    loading,
    error,
    fetchChannels,
    addChannel,
    deleteChannel,
    logoutChannel,
    startLogin,
    waitLogin,
  };
}
