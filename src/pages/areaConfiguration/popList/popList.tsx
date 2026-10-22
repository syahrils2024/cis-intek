// @ts-nocheck
/**
 * @typedef {import("src/stores/popListStore").PopListStore} PopListStore
 */

import { connect } from 'react-redux';
import Overloading from '@components/overloading';
import { usePrivilege } from '@auth/hooks/privileges';
import RewritePPPoEDialog from '@components/areaConfiguration2/RewritePPPoE';
import ServerFormDialog from '@components/areaConfiguration/ServerFormDialog';
import MigrationPackageBatch from '@components/customer/MigrationPackageBatch';
import MassIsolateDialog from '@components/areaConfiguration2/MassIsolateDialog';
import BroadcastRoundrobin from '@components/areaConfiguration/BroadcastRoundrobin';
import { BroadcastMessageDialog } from '@components/areaConfiguration/broadcastMessage';
import ServerFormDialogNext from '@components/ServerFormDialogNext/ServerFormDialogNext';

import { Menu, useTheme, MenuItem, TextField, Typography, useMediaQuery } from '@mui/material';

import * as PopListData from './PopListData';
import { usePopListState } from './popList.state';

/**
 * @param {PopListStore} props react props
 */
function PopList({ pop, search, order, orderBy }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAdmin, isNoc } = usePrivilege();

  const canManage = isAdmin || isNoc;

  const state = usePopListState({ pop, search, order, orderBy });

  return (
    <div className="tw-flex tw-flex-col tw-w-full">
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full tw-gap-2 tw-items-center tw-justify-between">
        <Typography variant="h4">Daftar POP</Typography>
        <div className="tw-w-full md:tw-w-48">
          <TextField
            label="Cari"
            defaultValue={search}
            size="small"
            fullWidth
            onChange={(e) => state.debounceSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="tw-flex tw-flex-col tw-w-full tw-gap-2 tw-mt-4 tw-relative">
        <Overloading loading={state.loading.value} />
        {isMobile ? (
          <PopListData.Mobile
            areas={pop}
            onMenu={canManage ? (event, p) => state.handleClick(event, p) : undefined}
          />
        ) : (
          <PopListData.Table
            areas={pop}
            onMenu={canManage ? (event, p) => state.handleClick(event, p) : undefined}
          />
        )}
      </div>
      <Menu
        id="basic-menu"
        anchorEl={state.anchorEl}
        open={state.open}
        onClose={state.handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => state.showBroadcastFormDialog()}>Broadcast Pesan</MenuItem>
        {canManage ? (
          <>
            <MenuItem onClick={() => state.showFormArea.onTrue()}>Edit</MenuItem>
            <MenuItem onClick={() => state.duplicateArea()}>Duplicate</MenuItem>
            <MenuItem onClick={() => state.onGenerateIdCustomer()}>
              Buat ID Customer Otomatis
            </MenuItem>
          </>
        ) : null}
        {isAdmin ? (
          <MenuItem onClick={() => state.massBillingGenerate(state.selectedPop)}>
            Generate Billing
          </MenuItem>
        ) : null}
        {canManage ? (
          <>
            <MenuItem onClick={() => state.onIsolate()}>Isolate Tagihan</MenuItem>
            <MenuItem onClick={() => state.onMigrationPackageBatch()}>
              Migrasi Paket Pelanggan
            </MenuItem>
            <MenuItem onClick={() => state.rewritePPPoE()}>Tulis PPPoE</MenuItem>
          </>
        ) : null}
      </Menu>
      <ServerFormDialog
        show={state.showFormArea.value}
        onClose={() => {
          state.showFormArea.onFalse();
          state.handleClose();
        }}
        selectedItem={state.selectedPop}
        onSubmit={(data) => state.onSubmitArea(data)}
      />
      <ServerFormDialogNext ref={state.serverFormDialogNextRef} />
      <BroadcastMessageDialog
        show={state.showBroadcastForm.value}
        onClose={() => {
          state.showBroadcastForm.onFalse();
          state.handleClose();
        }}
        onSubmit={(data) => state.onHandlerBroadcast(data)}
      />
      <MassIsolateDialog ref={state.massIsolateDialogRef} />
      <MigrationPackageBatch ref={state.migrationDialogRef} />
      <BroadcastRoundrobin ref={state.broadcastFormRef} />
      <RewritePPPoEDialog ref={state.rewritePPPoEDialogRef} />
    </div>
  );
}

const mapStateToProps = (state) => state.popListStore;

export default connect(mapStateToProps)(PopList);
