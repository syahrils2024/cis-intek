/* eslint-disable unused-imports/no-unused-imports */
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
/**
 * @typedef {Object} SocketStore
 * @property {boolean} isConnected
 * @property {Socket | null} client
 * @property {() => void} connect
 * @property {() => void} disconnect
 */

const domain = import.meta.env.VITE_SOCKET_DOMAIN || 'https://ws.cis-intek.id';

/** @type {SocketStore} */
export const useSocketStore = create((set, get) => ({
  client: null,
  isConnected: false,

  connect: () => {
    const socket = io(domain, {
      autoConnect: false,
      transports: ['websocket'],
    });

    set({ client: socket });

    socket.on('connect', () => {
      console.log('Connected to server');
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ isConnected: false });
    });

    get().client.connect();
  },

  disconnect: () => {
    set((state) => {
      if (state.client) {
        state.client.disconnect();
        state.client = null;
      }
      return {};
    });
  },
}));
