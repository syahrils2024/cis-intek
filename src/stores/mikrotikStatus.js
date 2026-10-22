import { create } from 'zustand';

/**
 * @typedef {import('src/repositories/mikrotik').ResultCheckConnection} ResultCheckConnection
 */

/**
 * @typedef {Object} MikrotikStore
 * @property {ResultCheckConnection} status
 * @property {string[]} logs
 * @property {string[]} pingHistory
 * @property {number[]} rxBits
 * @property {number[]} txBits
 * @property {string[]} trafficTime
 * @property {(data: ResultCheckConnection) => void} setStatus
 * @property {(data: logs[]) => void} setLogs
 * @property {(data: string[]) => void} setPingHistory
 * @property {(data: string[]) => void} setTrafficTime
 * @property {(data: string[]) => void} addTrafficTime
 * @property {(data: number[]) => void} setRxBits
 * @property {(data: number[]) => void} addRxBits
 * @property {(data: number[]) => void} setTxBits
 * @property {(data: number[]) => void} addTxBits
 * @property {() => void} reset
 */

/** @type {MikrotikStore} */
export const useMikrotikStore = create((set) => ({
  status: null,
  logs: [],
  pingHistory: [],
  rxBits: [],
  txBits: [],
  trafficTime: [],
  setRxBits: (data) => set((state) => ({ rxBits: data })),
  addRxBits: (data) => set((state) => ({ rxBits: [...state.rxBits, data] })),
  setTxBits: (data) => set((state) => ({ txBits: data })),
  addTxBits: (data) => set((state) => ({ txBits: [...state.txBits, data] })),
  setTrafficTime: (data) => set((state) => ({ trafficTime: data })),
  addTrafficTime: (data) => set((state) => ({ trafficTime: [...state.trafficTime, data] })),
  setStatus: (data) => set((state) => ({ status: data })),
  setLogs: (data) => set((state) => ({ logs: data })),
  setPingHistory: (data) => set((state) => ({ pingHistory: data })),
  reset: () =>
    set((state) => ({
      status: null,
      logs: [],
      pingHistory: [],
      rxBits: [],
      txBits: [],
      trafficTime: [],
    })),
}));
