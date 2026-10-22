// @ts-nocheck

import Overloading from '@components/overloading';

import { useTheme, useMediaQuery, TablePagination } from '@mui/material';

import TicketTable from 'src/components/ticket/table';
import TicketMobile from 'src/components/ticket/mobileCard';

import type { TicketDataTabContentProps } from '../types';

const DataTabContent = ({
  data,
  isLoading,
  showKtp,
  ticketLogFormRef,
  handleClick,
  sort,
  sortBy,
  setData,
  onChangeStatus,
  totalItems,
  page,
  limit,
  onChangeEngineer,
}: TicketDataTabContentProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div className="tw-flex tw-flex-col tw-mt-4 tw-relative tw-w-full tw-gap-2">
      <Overloading loading={isLoading.value} />
      {isMobile ? (
        <TicketMobile
          tickets={data}
          onMenu={handleClick}
          showKtp={(ktp) => showKtp(ktp)}
          showLogs={(ticket) => ticketLogFormRef.current?.open(ticket, ticket.customer_id)}
        />
      ) : (
        <TicketTable
          tickets={data}
          onMenu={handleClick}
          showKtp={(ktp) => showKtp(ktp)}
          sort={sort}
          sortBy={sortBy}
          onChangeSort={(sb, s) => setData({ sortBy: sb, sort: s })}
          dynamicStatus
          onChangeStatus={(ticket, newStatus) => onChangeStatus(ticket, newStatus)}
          showLogs={(ticket) => ticketLogFormRef.current?.open(ticket, ticket.customer_id)}
          onChangeEngineer={(ticket) => onChangeEngineer(ticket)}
        />
      )}
      <TablePagination
        component="div"
        count={totalItems}
        page={page}
        onPageChange={(e, n) => setData({ page: n })}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => setData({ page: 0, limit: e.target.value })}
      />
    </div>
  );
};

export default DataTabContent;
