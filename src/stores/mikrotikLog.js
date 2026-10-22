import { create } from 'zustand';

/**
 * @typedef {import('src/repositories/mikrotik').MikrotikActionLog} MikrotikActionLog
 */

/**
 * @typedef {object} MikrotikLogStore
 * @property {MikrotikActionLog[]} data
 * @property {number} page
 * @property {number} limit
 * @property {string} find
 * @property {string} remote
 * @property {number} totalItem
 * @property {Date} start
 * @property {Date} until
 * @property {import('@/repositories/area').Area} area
 * @property {(d: MikrotikActionLog[]) => void} setData
 * @property {(n: number) => void} setLimit
 * @property {(n: number) => void} setPage
 * @property {(s: string) => void} setFind
 * @property {(s: string) => void} setRemote
 * @property {(n: number) => void} setTotalItem
 * @property {(a) => void} setArea
 * @property {({start: Date, until: Date}) => void} setDateRange
 */

export const useMikrotikLog = create((set) => ({
  data: [],
  limit: 10,
  page: 0,
  find: '',
  remote: '',
  totalItem: 0,
  area: null,
  start: new Date(),
  until: new Date(),
  setData: (d) => set(() => ({ data: d })),
  setLimit: (n) => set(() => ({ limit: n })),
  setPage: (n) => set(() => ({ page: n })),
  setFind: (s) => set(() => ({ find: s })),
  setRemote: (s) => set(() => ({ remote: s })),
  setTotalItem: (n) => set(() => ({ totalItem: n })),
  setArea: (a) => set(() => ({ area: a })),
  setDateRange: ({ start, until }) => {
    if (start) set({ start });
    if (until) set({ until });
  },
}));
