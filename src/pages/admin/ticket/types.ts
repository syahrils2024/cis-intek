// @ts-nocheck

import type { Ticket } from 'src/repositories/ticket';
import type { Dispatch, MouseEvent, SetStateAction, MutableRefObject } from 'react';

export type TicketStatus = 'pending' | 'processed' | 'waiting_finishing' | 'finish';
export type TicketTab = 'ticket' | 'availableDismantle';
export type ShowKtp = (path: string) => void;

export interface TicketEngineer {
  _id: string;
  fullname?: string;
  status?: string;
}

export interface TicketRecord extends Ticket {
  engineers: TicketEngineer[];
  status: TicketStatus;
}

export interface TicketDialogHandle {
  open: (...args: any[]) => Promise<unknown> | void;
}

export interface TicketDataTabHandle {
  prefetch?: () => Promise<void> | void;
}

export interface TicketDataTabContentProps {
  data: TicketRecord[];
  isLoading: { value: boolean };
  showKtp: ShowKtp;
  ticketLogFormRef: MutableRefObject<TicketDialogHandle | null>;
  handleClick: (event: MouseEvent<HTMLElement>, ticket: TicketRecord) => void;
  sort: 'asc' | 'desc';
  sortBy: string;
  setData: Dispatch<SetStateAction<Record<string, unknown>>>;
  onChangeStatus: (ticket: TicketRecord, status: TicketStatus) => void;
  totalItems: number;
  page: number;
  limit: number;
  onChangeEngineer: (ticket: TicketRecord) => void;
}
