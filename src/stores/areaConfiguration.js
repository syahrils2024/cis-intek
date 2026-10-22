import { createSlice } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';

/**
 * @typedef {import('./areaStore').Area} Area
 * @typedef {import('src/repositories/customer').Customer} Customer
 * @typedef {import('src/repositories/area').AreaCategory} AreaCategory
 * @typedef {import('src/repositories/area').Odp} Odp
 */

/**
 * @typedef {Object} AreaConfigurationStore
 * @property {AreaCategory[]} nestedArea
 * @property {AreaCategory | Area | null} currentArea
 * @property {Odp | null} currentOdp
 * @property {Customer[]} customers
 * @property {number} page
 * @property {number} limit
 * @property {number} totalItems
 * @property {number} totalItems
 * @property {number} treeWidth
 * @property {string} find
 * @property {string} odpVariant
 * @property {string} customerOrderBy
 * @property {string} customerOrder
 * @property {string} odpOrderBy
 * @property {string} odpOrder
 * @property {string} [approveByFullname]
 */

/**
 * @typedef {'nestedArea' |
 * 'currentArea' |
 * 'currentOdp' |
 * 'customers' |
 * 'page' |
 * 'limit' |
 * 'totalItems' |
 * 'treeWidth' |
 * 'find' |
 * 'odpVariant' |
 * 'customerOrderBy' |
 * 'customerOrder' |
 * 'odpOrderBy' |
 * 'odpOrder'} AreaConfigurationStoreKey
 */
const initialState = {
  nestedArea: [],
  currentArea: null,
  currentOdp: null,
  customers: [],
  page: 0,
  limit: 10,
  totalItems: 0,
  treeWidth: 30,
  find: '',
  odpVariant: 'list',
  customerOrderBy: 'fullname',
  customerOrder: 'asc',
  odpOrderBy: 'name',
  odpOrder: 'asc',
};

const persistAreaConfigurationConfig = {
  key: 'areaConfiguration',
  storage,
};

const areaConfigurationSlice = createSlice({
  name: 'areaConfiguration',
  initialState,
  reducers: {
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: {key: AreaConfigurationStoreKey; value: any}}} body
     */
    setAreaConfigurationState(state, body) {
      const { key, value } = body.payload;
      state[key] = value;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: string}} body
     */
    setOdpVariant(state, body) {
      state.odpVariant = body.payload;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: string}} body
     */
    setFind(state, body) {
      state.find = body.payload;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: number}} body
     */
    setTreeWidth(state, body) {
      state.treeWidth = body.payload;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: number}} body
     */
    setTotalItems(state, body) {
      state.totalItems = body.payload;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: Customer[]}} body
     */
    setCustomers(state, body) {
      state.customers = body.payload;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: AreaCategory[]}} body
     */
    setNestedArea(state, body) {
      state.nestedArea = body.payload;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: {index: number, data: AreaCategory[]}}} body
     */
    appendAreaLevel1(state, body) {
      state.nestedArea[body.payload.index].areaCategoryChildren = body.payload.data;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: {parentIndex: number ,index: number, data: AreaCategory[]}}} body
     */
    appendAreaLevel2(state, body) {
      const { parentIndex, index, data } = body.payload;
      state.nestedArea[parentIndex].areaCategoryChildren[index].areaCategoryChildren = data;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: {grandParentIndex: number ,parentIndex: number ,index: number, data: Odp[]}}} body
     */
    appendODP(state, body) {
      const { parentIndex, index, data, grandParentIndex } = body.payload;
      state.nestedArea[grandParentIndex].areaCategoryChildren[parentIndex].areaCategoryChildren[
        index
      ].areaCategoryChildren = data;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: Area | AreaCategory}} body
     */
    setSelectedArea(state, body) {
      state.currentArea = body.payload;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: Odp}} body
     */
    setSelectedOdp(state, body) {
      state.currentOdp = body.payload;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: number}} body
     */
    setPage(state, body) {
      state.page = body.payload;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: number}} body
     */
    setLimit(state, body) {
      state.limit = body.payload;
    },
    /**
     * @param {AreaConfigurationStore} state
     * @param {{payload: {
     * index0: number;
     * index1: number;
     * index2: number;
     * index3: number;
     * index4: number;
     * index5: number;
     * key0: string;
     * key1: string;
     * key2: string;
     * key3: string;
     * key4: string;
     * key5: string;
     * category: AreaCategory[];
     * odp: Odp[];
     * odc: Odp[];
     * pon: Odp[];
     * }}} body
     */
    setNestedAreaStore(state, body) {
      const {
        index5,
        index4,
        index3,
        index2,
        index1,
        index0,
        category,
        odc,
        odp,
        pon,
        key0,
        key1,
        key2,
        key3,
        key4,
        key5,
      } = body.payload;

      if (index5 !== undefined) {
        // Category
        const items = {
          ...state.nestedArea[index0][key1][index1][key2][index2][key3][index3][key4][index4][key5][
            index5
          ],
          areaCategoryChildren: category,
          odpChildren: odp,
          odcChildren: odc,
          ponChildren: pon,
        };

        state.nestedArea[index0][key1][index1][key2][index2][key3][index3][key4][index4][key5][
          index5
        ] = items;
      } else if (index4 !== undefined) {
        /** Index 4 */
        // Category
        const items = {
          ...state.nestedArea[index0][key1][index1][key2][index2][key3][index3][key4][index4],
          areaCategoryChildren: category,
          odpChildren: odp,
          odcChildren: odc,
          ponChildren: pon,
        };

        state.nestedArea[index0][key1][index1][key2][index2][key3][index3][key4][index4] = items;
      } else if (index3 !== undefined) {
        /** Index 3 */
        // Category
        const items = {
          ...state.nestedArea[index0][key1][index1][key2][index2][key3][index3],
          areaCategoryChildren: category,
          odpChildren: odp,
          odcChildren: odc,
          ponChildren: pon,
        };

        state.nestedArea[index0][key1][index1][key2][index2][key3][index3] = items;
      } else if (index2 !== undefined) {
        /** Index 2 */
        // Category
        const items = {
          ...state.nestedArea[index0][key1][index1][key2][index2],
          areaCategoryChildren: category,
          odpChildren: odp,
          odcChildren: odc,
          ponChildren: pon,
        };

        state.nestedArea[index0][key1][index1][key2][index2] = items;
      } else if (index1 !== undefined) {
        /** Index 1 */
        // Category
        const items = {
          ...state.nestedArea[index0][key1][index1],
          areaCategoryChildren: category,
          odpChildren: odp,
          odcChildren: odc,
          ponChildren: pon,
        };

        state.nestedArea[index0][key1][index1] = items;
      } else if (index0 !== undefined) {
        /** Index 0 */
        // Category
        const items = {
          ...state.nestedArea[index0],
          areaCategoryChildren: category ?? [],
          odpChildren: odp ?? [],
          odcChildren: odc ?? [],
          ponChildren: pon ?? [],
        };
        state.nestedArea[index0] = items;
      }
    },
  },
});

export const {
  appendAreaLevel1,
  appendAreaLevel2,
  appendODP,
  setLimit,
  setNestedArea,
  setPage,
  setSelectedArea,
  setSelectedOdp,
  setCustomers,
  setTotalItems,
  setNestedAreaStore,
  setTreeWidth,
  setFind,
  setOdpVariant,
  setAreaConfigurationState,
} = areaConfigurationSlice.actions;
export default areaConfigurationSlice.reducer;
// export default areaConfigurationSlice.reducer;
