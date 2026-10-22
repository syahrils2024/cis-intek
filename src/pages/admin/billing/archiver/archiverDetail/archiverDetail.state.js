/**
 * @typedef {import("src/repositories/subscription").ArchiveInvoice} ArchiveInvoice
 * @typedef {import('socket.io-client').Socket} Socket
 */

import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useBoolean } from '@hooks/use-boolean';
import { useRef, useMemo, useState, useEffect } from 'react';

import { useTheme, useMediaQuery } from '@mui/material';

import { subscriptionRepository } from 'src/repositories';

export function useArchiverDetailState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  /** @type {[ArchiveInvoice, Function]} */
  const [data, setData] = useState(null);
  const show = useBoolean(false);
  const loading = useBoolean(false);

  /// Computed
  const allowDownload = useMemo(() => !!data?.finishedAt, [data]);
  const messageLogs = useMemo(() => data?.logMessage || [], [data]);
  const archivedFiles = useMemo(() => {
    if (!data) return '';
    return `${data.archivedFiles} / ${data.totalFiles}`;
  }, [data]);

  /** @type {import('react').MutableRefObject<Socket>} */
  const ws = useRef();

  /** @type {import('react').MutableRefObject<HTMLDivElement>} */
  const scrollRef = useRef();

  const resolver = useRef();

  // Auto-scroll when messageLogs change
  useEffect(() => {
    if (messageLogs.length > 0) {
      scrollToBottom();
    }
  }, [messageLogs]);

  function scrollToBottom() {
    if (scrollRef.current) {
      // Use double requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        });
      });
    }
  }

  function connectWebSocket(roomName) {
    const id = roomName.split('-').slice(-1)[0];
    const event = roomName;
    const domain = import.meta.env.VITE_SOCKET_DOMAIN || 'http://localhost:4000';
    // const domain = 'ws://localhost:4000';

    if (!ws.current) {
      ws.current = io(domain, {
        autoConnect: false,
      });
    }

    const socketClient = ws.current;

    socketClient.close();

    socketClient.on('connect', () => {
      console.log('Connected to WebSocket for archiver detail');
    });

    socketClient.on('disconnect', () => {
      console.log('Disconnected from WebSocket for archiver detail');
    });

    socketClient.on(event, (message) => {
      setData((prev) => ({
        ...prev,
        archivedFiles: Math.min(prev.totalFiles, prev.archivedFiles + 1),
        logMessage: [...(prev.logMessage || []), message],
      }));
      // Remove manual scroll call - useEffect will handle it
      if (message.toString().toLowerCase() === 'finish') {
        socketClient.disconnect();
        load(id);
      }
    });

    socketClient.connect();
  }

  async function load(_id, withConnect = false) {
    loading.onTrue();
    try {
      const snapshot = await subscriptionRepository.getArchiveInvoiceDetail(_id);
      setData(snapshot);
      const roomName = `invoice-archiver-${snapshot._id}`;
      if (withConnect) connectWebSocket(roomName);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  const download = () => subscriptionRepository.archiveInvoicedownload(data._id);

  function close() {
    ws.current?.close();
    show.onFalse();
    setData(null);
  }

  function open(_id) {
    show.onTrue();
    load(_id, true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  return {
    data,
    load,
    close,
    loading,
    show,
    open,
    mobile,
    messageLogs,
    scrollRef,
    archivedFiles,
    allowDownload,
    download,
  };
}
