import { create } from 'zustand';

/**
 * @typedef {import('src/repositories/customer').CustomerMigrationPackageLog} CustomerMigrationPackageLog
 */

/**
 * @typedef {'search' | 'page' | 'limit' | 'fromPackageId' | 'toPackageId' | 'data' | 'total' } MigrationLogStoreKey
 */

/**
 * @typedef {Object} MigrationLogStore
 * @property {string} search
 * @property {number} page
 * @property {number} limit
 * @property {string} fromPackageId
 * @property {string} toPackageId
 * @property {number} total
 * @property {CustomerMigrationPackageLog[]} data
 * @property {(params: { key: MigrationLogStoreKey, value: any }) => void} setStoreData
 */

export const useMigrationLogStore = create((set) => ({
  search: '',
  page: 0,
  limit: 10,
  fromPackageId: '',
  toPackageId: '',
  data: [],
  total: 0,
  setStoreData: ({ key, value }) => set({ [key]: value }),
}));
