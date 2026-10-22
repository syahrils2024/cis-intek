/* eslint-disable consistent-return */
import { io } from 'socket.io-client';
import { useRef, useState, useEffect, useCallback } from 'react';

/** @typedef {import('src/repositories/networkMonitoring').NetworkMonitoringDevice} NetworkMonitoringDevice */

export function useNetworkMonitoringSocket() {
  const [status, setStatus] = useState('disconnected');
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const handlersRef = useRef(new Map());

  const url = import.meta.env.VITE_WS_NETWORK_MONITORING_URL;

  // Initialize socket once
  useEffect(() => {
    if (socketRef.current) return;

    const newSocket = io(url, {
      path: '/api/network-monitoring/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setStatus('connected');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.error('Socket disconnected:', reason);
      setStatus('disconnected');

      // Auto-reconnect
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (newSocket.disconnected) {
          console.log('Attempting to reconnect...');
          newSocket.connect();
        }
      }, 3000);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setStatus('error');
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (newSocket) {
        newSocket.disconnect();
      }
      socketRef.current = null;
    };
  }, [url]);

  const onDeviceUpdate = useCallback((handler) => {
    if (!socketRef.current) return;

    // Store handler reference
    handlersRef.current.set('UPDATE_DEVICE', handler);

    // Remove old listener if exists
    socketRef.current.off('UPDATE_DEVICE');

    // Add new listener
    socketRef.current.on('UPDATE_DEVICE', handler);
  }, []);

  return {
    status,
    onDeviceUpdate,
    connect: () => socketRef.current?.connect(),
    disconnect: () => socketRef.current?.disconnect(),
  };
}
