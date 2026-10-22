import { create } from 'zustand';
import { addDays } from 'date-fns';

/**
 * @typedef {import('src/repositories/customerTransactionAdmin').CustomerTransactionAdmin} CustomerTransactionAdmin
 */

/**
 * @typedef {Object} CustomerTransactionAdminStore
 * @property {Date} start
 * @property {Date} until
 * @property {string} area
 * @property {string} areaName
 * @property {string} status
 * @property {number} limit
 * @property {number} page
 * @property {number} totalItems
 * @property {string} find
 * @property {CustomerTransactionAdmin[]} data
 * @property {(value: Date) => void} setStart
 * @property {(value: Date) => void} setUntil
 * @property {(value: {_id: string; title: string}) => void} setArea
 * @property {(value: string) => void} setStatus
 * @property {(value: number) => void} setLimit
 * @property {(value: number) => void} setPage
 * @property {(value: CustomerTransactionAdmin[]) => void} setData
 * @property {(value: number) => void} setTotalItems
 * @property {(value: string) => void} setFind
 */

/**
 * @type {CustomerTransactionAdminStore}
 */
export const useCustomerTransactionAdmin = create((set) => ({
  start: addDays(new Date(), -3),
  until: new Date(),
  area: '',
  areaName: 'Semua',
  status: 'all',
  limit: 10,
  page: 0,
  data: [],
  totalItems: 0,
  find: '',
  setStart: (value) => set(() => ({ start: value })),
  setUntil: (value) => set(() => ({ until: value })),
  setArea: (value) => set(() => ({ area: value._id, areaName: value.title })),
  setStatus: (value) => set(() => ({ status: value })),
  setLimit: (value) => set(() => ({ limit: value })),
  setPage: (value) => set(() => ({ page: value })),
  setData: (value) => set(() => ({ data: value })),
  setTotalItems: (value) => set(() => ({ totalItems: value })),
  setFind: (value) => set(() => ({ find: value })),
}));
