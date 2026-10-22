import { create } from 'zustand';
import { addDays, startOfMonth } from 'date-fns';

/**
 * @typedef {import('src/repositories/ticket').Ticket} Ticket
 * @typedef {import('src/repositories/ticket').TicketDashboard} TicketDashboard
 */

/**
 * @typedef {Object} SetterData
 * @property {any} data
 * @property {number} page
 * @property {number} limit
 * @property {string} search
 * @property {number} totalItems
 * @property {Date} start
 * @property {Date} until
 * @property {string} areaId
 * @property {string} areaTitle
 * @property {string} ticketType
 * @property {string} sortBy
 * @property {'asc' | 'desc'} sort
 * @property {string} status
 * @property {TicketDashboard[]} ticketDashboard
 * @property {Date} start
 * @property {Date} until
 * @property {import('src/repositories/user').User} createdBy
 */

/**
 * Zustand store for ticket management.
 * @typedef {Object} TicketMainStore
 * @property {TicketDashboard} ticketDashboard
 * @property {Date} start
 * @property {Date} until
 * ----- MERGE DATA -----
 * @property {number} page
 * @property {Ticket[]} data
 * @property {number} limit
 * @property {string} search
 * @property {number} totalItems
 * @property {string} areaId
 * @property {string} areaTitle
 * @property {string[]} ticketType
 * @property {string} sortBy
 * @property {'asc' | 'desc'} sort
 * @property {import('src/repositories/user').User} createdBy
 * @property {(customerId: String, status: String) => void} setStatus
 * ----- PENDING ------
 * @property {number} pendingDataPage
 * @property {Ticket[]} pendingData
 * @property {number} pendingDatalimit
 * @property {string} pendingDataSearch
 * @property {number} pendingTotalItems
 * @property {Date} pendingStart
 * @property {Date} pendingUntil
 * @property {string} pendingAreaId
 * @property {string} pendingAreaTitle
 * @property {string} pendingTicketType
 * @property {string} pendingSortBy
 * @property {'asc' | 'desc'} pendingSort
 * ----- PROGRESS ------
 * @property {Ticket[]} progressData
 * @property {number} progressPage
 * @property {number} progressLimit
 * @property {string} progressSearch
 * @property {number} progressTotalItems
 * @property {Date} progressStart
 * @property {Date} progressUntil
 * @property {string} progressAreaId
 * @property {string} progressAreaTitle
 * @property {string} progressTicketType
 * @property {string} progressSortBy
 * @property {'asc' | 'desc'} progressSort
 * ----- WAITING FINISH ------
 * @property {Ticket[]} waitingFinish
 * @property {number} waitingFinishPage
 * @property {number} waitingFinishLimit
 * @property {string} waitingFinishSearch
 * @property {number} waitingFinishTotalItems
 * @property {Date} waitingFinishStart
 * @property {Date} waitingFinishUntil
 * @property {string} waitingFinishAreaId
 * @property {string} waitingFinishAreaTitle
 * @property {string} waitingFinishTicketType
 * @property {string} waitingFinishSortBy
 * @property {'asc' | 'desc'} waitingFinishSort
 * ------ FINISHED ------
 * @property {Ticket[]} finished
 * @property {number} finishedPage
 * @property {number} finishedLimit
 * @property {string} finishedSearch
 * @property {number} finishedTotalItems
 * @property {Date} finishedStart
 * @property {Date} finishedUntil
 * @property {string} finishedAreaId
 * @property {string} finishedAreaTitle
 * @property {string} finishedTicketType
 * @property {string} finishedSortBy
 * @property {'asc' | 'desc'} finishedSort
 * ----- METHOD -----
 * @property {(data: SetterData) => void} setPendingData
 * @property {(data: SetterData) => void} setProgressData
 * @property {(data: SetterData) => void} setWaitingFinish
 * @property {(data: SetterData) => void} setFinished
 * @property {(data: SetterData) => void} setData
 */

export const useTicketMainStore = create((set) => ({
  ticketDashboard: {},
  start: startOfMonth(new Date()),
  until: new Date(),
  // Merge Data
  page: 0,
  data: [],
  limit: 10,
  search: '',
  totalItems: 0,
  areaId: '',
  areaTitle: '',
  createdBy: null,
  ticketType: [
    'maintenance',
    'problem',
    'internet_trouble',
    'other',
    'upgrade_request',
    'dismaintenance',
    'dismaintenance_no_ticket',
    'addons_request',
  ],
  sortBy: 'createdAt',
  sort: 'desc',
  status: '',
  // Pending Data
  pendingDataPage: 0,
  pendingData: [],
  pendingDatalimit: 10,
  pendingDataSearch: '',
  pendingTotalItems: 0,
  pendingAreaId: '',
  pendingAreaTitle: '',
  pendingTicketType: '',
  pendingSortBy: 'createdAt',
  pendingSort: 'desc',
  // progessData
  progressData: [],
  progressPage: 0,
  progressLimit: 10,
  progressSearch: '',
  progressTotalItems: 0,
  progressAreaId: '',
  progressAreaTitle: '',
  progressTicketType: '',
  progressSortBy: 'createdAt',
  progressSort: 'desc',
  // waiting finish
  waitingFinish: [],
  waitingFinishPage: 0,
  waitingFinishLimit: 10,
  waitingFinishSearch: '',
  waitingFinishTotalItems: 0,
  waitingFinishAreaId: '',
  waitingFinishAreaTitle: '',
  waitingFinishTicketType: '',
  waitingFinishSortBy: 'createdAt',
  waitingFinishSort: 'desc',
  // finished
  finished: [],
  finishedPage: 0,
  finishedLimit: 10,
  finishedSearch: '',
  finishedTotalItems: 0,
  finishedStart: addDays(new Date(), -3),
  finishedUntil: new Date(),
  finishedAreaId: '',
  finishedAreaTitle: '',
  finishedTicketType: '',
  finishedSortBy: 'createdAt',
  finishedSort: 'desc',
  // setter
  /** @param {SetterData} data */
  setData: (data) => {
    if (data.data) set(() => ({ data: data.data }));
    if (typeof data.limit === 'number') set(() => ({ limit: data.limit }));
    if (typeof data.page === 'number') set(() => ({ page: data.page }));
    if (typeof data.search === 'string') set(() => ({ search: data.search }));
    if (typeof data.totalItems === 'number') set(() => ({ totalItems: data.totalItems }));
    if (typeof data.areaId === 'string') set(() => ({ areaId: data.areaId }));
    if (typeof data.areaTitle === 'string') set(() => ({ areaTitle: data.areaTitle }));
    if (Array.isArray(data.ticketType)) set(() => ({ ticketType: data.ticketType }));
    if (typeof data.sortBy === 'string') set(() => ({ sortBy: data.sortBy }));
    if (typeof data.sort === 'string') set(() => ({ sort: data.sort }));
    if (typeof data.status === 'string') set(() => ({ status: data.status }));

    if (typeof data.ticketDashboard !== 'undefined')
      set(() => ({ ticketDashboard: data.ticketDashboard }));

    if (data.start) set(() => ({ start: data.start }));
    if (data.until) set(() => ({ until: data.until }));
    if (typeof data.createdBy !== 'undefined') set(() => ({ createdBy: data.createdBy }));
  },
  /** @param {SetterData} data */
  setPendingData: (data) => {
    if (data.data) set(() => ({ pendingData: data.data }));
    if (typeof data.limit === 'number') set(() => ({ pendingDatalimit: data.limit }));
    if (typeof data.page === 'number') set(() => ({ pendingDataPage: data.page }));
    if (typeof data.search === 'string') set(() => ({ pendingDataSearch: data.search }));
    if (typeof data.totalItems === 'number') set(() => ({ pendingTotalItems: data.totalItems }));
    if (typeof data.areaId === 'string') set(() => ({ pendingAreaId: data.areaId }));
    if (typeof data.areaTitle === 'string') set(() => ({ pendingAreaTitle: data.areaTitle }));
    if (typeof data.ticketType === 'string') set(() => ({ pendingTicketType: data.ticketType }));
    if (typeof data.sortBy === 'string') set(() => ({ pendingSortBy: data.sortBy }));
    if (typeof data.sort === 'string') set(() => ({ pendingSort: data.sort }));
  },
  /** @param {SetterData} data */
  setProgressData: (data) => {
    if (data.data) set(() => ({ progressData: data.data }));
    if (typeof data.limit === 'number') set(() => ({ progressLimit: data.limit }));
    if (typeof data.page === 'number') set(() => ({ progressPage: data.page }));
    if (typeof data.search === 'string') set(() => ({ progressSearch: data.search }));
    if (typeof data.totalItems === 'number') set(() => ({ progressTotalItems: data.totalItems }));
    if (typeof data.areaId === 'string') set(() => ({ progressAreaId: data.areaId }));
    if (typeof data.areaTitle === 'string') set(() => ({ progressAreaTitle: data.areaTitle }));
    if (typeof data.ticketType === 'string') set(() => ({ progressTicketType: data.ticketType }));
    if (typeof data.sortBy === 'string') set(() => ({ progressSortBy: data.sortBy }));
    if (typeof data.sort === 'string') set(() => ({ progressSort: data.sort }));
  },
  /** @param {SetterData} data */
  setWaitingFinish: (data) => {
    if (!data) return;
    if (data.data) set(() => ({ waitingFinish: data.data }));
    if (typeof data.limit === 'number') set(() => ({ waitingFinishLimit: data.limit }));
    if (typeof data.page === 'number') set(() => ({ waitingFinishPage: data.page }));
    if (typeof data.search === 'string') set(() => ({ waitingFinsihSearch: data.search }));
    if (typeof data.totalItems === 'number')
      set(() => ({ waitingFinishTotalItems: data.totalItems }));
    if (typeof data.areaId === 'string') set(() => ({ waitingFinishAreaId: data.areaId }));
    if (typeof data.areaTitle === 'string') set(() => ({ waitingFinishAreaTitle: data.areaTitle }));
    if (typeof data.ticketType === 'string')
      set(() => ({ waitingFinishTicketType: data.ticketType }));
    if (typeof data.sortBy === 'string') set(() => ({ waitingFinishSortBy: data.sortBy }));
    if (typeof data.sort === 'string') set(() => ({ waitingFinishSort: data.sort }));
  },
  setFinished: (data) => {
    if (!data) return;
    if (data.start) set(() => ({ finishedStart: data.start }));
    if (data.until) set(() => ({ finishedUntil: data.until }));
    if (data.data) set(() => ({ finished: data.data }));
    if (typeof data.limit === 'number') set(() => ({ finishedLimit: data.limit }));
    if (typeof data.page === 'number') set(() => ({ finishedPage: data.page }));
    if (typeof data.search === 'string') set(() => ({ finishedSearch: data.search }));
    if (typeof data.totalItems === 'number') set(() => ({ finishedTotalItems: data.totalItems }));
    if (typeof data.areaId === 'string') set(() => ({ finishedAreaId: data.areaId }));
    if (typeof data.areaTitle === 'string') set(() => ({ finishedAreaTitle: data.areaTitle }));
    if (typeof data.ticketType === 'string') set(() => ({ finishedTicketType: data.ticketType }));
    if (typeof data.sortBy === 'string') set(() => ({ finishedSortBy: data.sortBy }));
    if (typeof data.sort === 'string') set(() => ({ finishedSort: data.sort }));
  },
  setStatus: (ticketId, status) => {
    set((state) => ({
      data: state.data.map((item) => (item._id === ticketId ? { ...item, status } : item)),
    }));
  },
}));
