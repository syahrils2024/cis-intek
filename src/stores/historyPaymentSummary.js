import { create } from 'zustand';

/**
 * @typedef {object} SetFilterAreaParam
 * @property {string} name
 * @property {string} _id
 */

/**
 * @typedef {Object} HistoryPaymentStore
 * @property {import('src/repositories/subscription').PaymentHistorySummary[]} data
 * @property {Date} start
 * @property {Date} until
 * @property {string} selectedAreaName
 * @property {string} selectedAreaId
 * @property {(d: Date) => void} setData
 * @property {(d: Date) => void} setStart
 * @property {(d: Date) => void} setUntil
 * @property { (d: SetFilterAreaParam) => void} setFilterArea
 */

/**
 * @typedef {Object} HistoryPaymentByAreaStore
 * @property {import('src/repositories/subscription').PaymentHistorySummaryByAreaCategory[]} data
 * @property {Date} start
 * @property {Date} until
 * @property {void} setData
 * @property {(d: Date) => void} setStart
 * @property {(d: Date) => void} setUntil
 * @property {({dStart: Date, dUntil: Date}) => void} setDate
 */

/**
 * @type {HistoryPaymentStore}
 */
export const useHistoryPaymentStore = create((set) => ({
  data: [],
  start: new Date(),
  until: new Date(),
  selectedAreaName: 'Semua',
  selectedAreaId: '',
  setData: (d) => set((state) => ({ data: d })),
  setStart: (d) => set((state) => ({ start: d })),
  setUntil: (d) => set((state) => ({ until: d })),
  setFilterArea: ({ name, _id }) =>
    set((state) => ({ selectedAreaName: name, selectedAreaId: _id })),
}));

/**
 * @typedef {HistoryPaymentByAreaStore}
 */
export const useHistoryPaymentStoreByArea = create((set) => ({
  data: [],
  start: new Date(),
  until: new Date(),
  setData: (d) => set((state) => ({ data: d })),
  setStart: (d) => set((state) => ({ start: d })),
  setUntil: (d) => set((state) => ({ until: d })),
  setDate: ({ dStart, dUntil }) =>
    set((state) => {
      if (dStart) state.start = dStart;
      if (dUntil) state.until = dUntil;
      return state;
    }),
}));
