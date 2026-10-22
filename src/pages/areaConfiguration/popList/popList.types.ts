import type { MouseEvent } from 'react';
import type { GetAllAreaWithCategory } from 'src/repositories/area';

export type Area = GetAllAreaWithCategory;
export type NetStatus = 'up' | 'down' | null | undefined;
export type NetTimestamp = string | number | Date | null | undefined;
export type PopMenuHandler = (event: MouseEvent<HTMLElement>, area: Area) => void;

export type PopListDataProps = {
  areas: Area[];
  onMenu?: PopMenuHandler;
  orderBy?: string;
  order?: string;
  readOnly?: boolean;
};
