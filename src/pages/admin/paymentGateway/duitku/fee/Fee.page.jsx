import { useRef, useEffect } from 'react';
import Overloading from '@components/overloading';

import { Stack, useTheme, useMediaQuery, TablePagination } from '@mui/material';

import { FeeData } from './FeeData';
import FeeFormDialog from './FeeForm';
import { useFeeState } from './fee.state';

/** @typedef {import("src/repositories/duitku").DuitkuFee} DuitkuFee */

export function DuitkuFeePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { filteredData, limit, loading, page, prefetch, search, setState, data } = useFeeState();
  const feeFormRef = useRef();

  /** @param {DuitkuFee} item */
  async function edit(item) {
    const res = await feeFormRef.current.open(item);
    prefetch();
  }

  useEffect(() => {
    prefetch();
  }, []);

  return (
    <>
      <Stack spacing={2}>
        <Overloading loading={loading} />
        {isMobile ? (
          <FeeData.Mobile data={filteredData} onEdit={(item) => edit(item)} />
        ) : (
          <FeeData.Table data={filteredData} onEdit={(item) => edit(item)} />
        )}
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={(e, n) => setState({ page: n })}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setState({ page: 0, limit: e.target.value });
          }}
        />
      </Stack>
      <FeeFormDialog ref={feeFormRef} />
    </>
  );
}
