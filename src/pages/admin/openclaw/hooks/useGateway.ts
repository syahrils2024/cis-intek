import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { SOCKET_DOMAIN } from '@commons/constant';

import { openclawRepository } from 'src/repositories';

import type { UseOpenclawGatewayReturn } from '../openclaw.types';

type OperationCommand =
  | {
      operationId: string;
      operation: 'start' | 'stop' | 'restart';
      state: 'pending' | 'completed' | 'failed' | 'accepted';
      message: string;
    }
  | {
      action: 'restart' | 'stop';
      ok: true;
      stdout: string;
      stderr: string;
    };

const LISTEN_GATEWAY_STATUS = 'openclaw:gateway:status';
const EMIT_GATEWAY_COMMAND = 'openclaw:gateway:command';

function createSocket() {
  const socket = io(SOCKET_DOMAIN, {
    transports: ['websocket'],
    reconnection: true,
    autoConnect: false,
  });
  return socket;
}

export function useOpenclawGateway(): UseOpenclawGatewayReturn {
  const running = useBoolean(false);
  const loading = useBoolean(false);
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();
  const socketRef = useRef<ReturnType<typeof createSocket>>(createSocket());

  socketRef.current.on(LISTEN_GATEWAY_STATUS, (status: OperationCommand) => {
    const isFirstSchema = 'operationId' in status;
    const isSecondSchema = 'action' in status;
    if (isFirstSchema) {
      if (status.state === 'accepted') {
        loading.onTrue();
      }
      if (status.state === 'failed') {
        loading.onFalse();
        setError(status.message || 'Failed to perform operation');
      }
      if (status.state === 'completed') {
        loading.onFalse();
        checkGateway();
      }
    }

    if (!isSecondSchema) return;
    if (status.ok) {
      loading.onFalse();
      checkGateway();
    }

    if (!!status.stderr) setError('Failed to perform operation');
  });

  socketRef.current.on('connect', () => {
    socketRef.current.emit('status');
  });

  socketRef.current.connect();

  async function checkGateway() {
    loading.onTrue();
    setError(null);
    try {
      const response = await openclawRepository.getGatewayStatus();
      running.setValue(response.running);
      return response.running;
    } catch (err) {
      running.setValue(false);
      return false;
    } finally {
      loading.onFalse();
    }
  }

  async function startGateway() {
    const isRestart = running.value;
    const message = isRestart ? 'Restarting AI gateway...' : 'Starting AI gateway...';
    socketRef.current.emit(EMIT_GATEWAY_COMMAND, { operation: 'restart' });
    toast.info(message);
    loading.onTrue();
    // try {
    //   const isRestart = running.value;
    //   if (isRestart) {
    //     await confirm({
    //       title: 'Restart AI Gateway',
    //       description: 'Apakah anda yakin ingin melakukan restart AI Gateway?',
    //       confirmationText: 'Restart',
    //       confirmationButtonProps: { color: 'primary' },
    //       cancellationText: 'Batal',
    //     });
    //   }

    //   setError(null);
    //   const promise = openclawRepository.restartGateway();
    //   const loadingMessage = isRestart ? 'Restarting AI gateway...' : 'Starting AI gateway...';
    //   toast.promise(promise, {
    //     loading: loadingMessage,
    //     success: () => 'AI gateway started successfully',
    //     // error: (err) => err.message || 'Failed to start AI gateway',
    //   });
    // } catch (err) {
    //   if (err instanceof Error) {
    //     toast.error(err.message || 'Failed to start AI gateway');
    //   }
    // }
  }

  async function stopGateway() {
    const message = 'Stopping AI gateway...';
    socketRef.current.emit(EMIT_GATEWAY_COMMAND, { operation: 'stop' });
    toast.info(message);
    loading.onTrue();
    // try {
    //   await confirm({
    //     title: 'Stop AI Gateway',
    //     description: 'Apakah anda yakin ingin menghentikan AI Gateway?',
    //     confirmationText: 'Stop',
    //     confirmationButtonProps: { color: 'error' },
    //     cancellationText: 'Batal',
    //   });

    //   const promise = openclawRepository.stopGateway();
    //   toast.promise(promise, {
    //     loading: 'Stopping AI gateway...',
    //     success: () => 'AI gateway stopped successfully',
    //     // error: (err) => err.message || 'Failed to stop AI gateway',
    //   });
    // } catch (err) {
    //   if (err instanceof Error) {
    //     toast.error(err.message || 'Failed to stop AI gateway');
    //   }
    // }
  }

  return {
    running: running.value,
    loading: loading.value,
    error,
    checkGateway,
    startGateway,
    stopGateway,
  };
}
