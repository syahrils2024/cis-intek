/** @typedef {import("src/repositories/broadcastOptionTemplate").BroadcastOptionTemplate} BroadcastOptionTemplate */

import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { useTheme, useMediaQuery } from '@mui/material';

import { broadcastOptionTemplateRepository } from 'src/repositories';

export function useBroadcastProfilePickerState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const show = useBoolean(false);
  const loading = useBoolean(false);
  /** @type {[BroadcastOptionTemplate[], void]} */
  const [data, setData] = useState([]);

  const resolver = useRef();

  async function loadData() {
    loading.onTrue();
    try {
      const snapshot = await broadcastOptionTemplateRepository.findAll();
      setData(snapshot);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function open() {
    show.onTrue();
    loadData();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  /** @param {BroadcastOptionTemplate} item */
  async function close(item) {
    show.onFalse();
    if (resolver.current) {
      resolver.current(item);
    }
  }

  return {
    state: {
      show,
      loading,
      data,
      mobile,
    },
    handlers: {
      loadData,
      close,
      open,
    },
  };
}
