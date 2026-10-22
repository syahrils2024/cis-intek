/**
 * @typedef {import("src/repositories/inventory").Inventory} Inventory
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} InventoryStore
 * @property {Inventory[]} items
 * @property {string} orderBy
 * @property {string} order
 */

/**
 * @typedef {'items' | 'orderBy' | 'order'} InventoryStoreKey
 */

/**
 * @type {InventoryStore}
 */
const initialState = {
  items: [],
  order: 'asc',
  orderBy: 'name',
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    /**
     *
     * @param {InventoryStore} state
     * @param {{payload: {key: InventoryStoreKey, value: any}}} body
     */
    setInventoryStore(state, body) {
      const { key, value } = body.payload;
      state[key] = value;
    },
    /**
     * @param {InventoryStore} state
     * @param {{payload: Inventory[]}} body
     */
    setItems(state, body) {
      state.items = body.payload;
    },
  },
});

export const { setItems, setInventoryStore } = inventorySlice.actions;
export default inventorySlice.reducer;
