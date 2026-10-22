import Overloading from '@components/overloading';
import { forwardRef, useImperativeHandle } from 'react';

import { Stack, TextField } from '@mui/material';

import BindConfirmation from './BindConfirmation';
import { UnbindSerialNumberData } from './UnbindSerialNumberData';
import { useUnbindSerialNumberState } from './unbindSerialNumber.state';

export const UnbindSerialNumber = forwardRef((props, ref) => {
  const { handlers, state, ref: innerRef } = useUnbindSerialNumberState();
  useImperativeHandle(ref, () => ({ load: handlers.load, reset: handlers.reset }));

  return (
    <>
      <Stack className="tw-relative tw-py-1" spacing={2}>
        <Overloading loading={state.loading.value} />
        <div className="tw-w-full lg:tw-max-w-48 tw-self-end">
          <TextField
            label="Cari"
            size="small"
            fullWidth
            value={state.search}
            onChange={(e) => handlers.setSearch(e.target.value)}
          />
        </div>
        {state.isMobile ? (
          <UnbindSerialNumberData.Mobile
            data={state.filteredData}
            onBind={handlers.bindToCustomer}
          />
        ) : (
          <UnbindSerialNumberData.Table
            data={state.filteredData}
            onBind={handlers.bindToCustomer}
          />
        )}
      </Stack>
      <BindConfirmation ref={innerRef.bindSerialNumberConfirmRef} />
    </>
  );
});
