import { Icon } from '@iconify/react';
import Overloading from '@components/overloading';

import { Grid, Button, Dialog, useTheme, useMediaQuery, DialogContent } from '@mui/material';

import WhatsappNodeTable from './WhatsappNodeTable';
import WhatsAppGroupPanel from './whatsappGroupPanel';
import WhatsappNodeForm from '../forms/whatsappNodeForm';
import WhatsappNodeScanModal from './whatsappNodeScanModal';
import WhatsappConsoleDialog from './whatsappConsoleDialog';
import WhatsappNodeMobileCard from './WhatsappNodeMobileCard';
import useWhatsappNodePanelState from './whatsappNodePanel.state';

export default function WhatsappNodePanel() {
  const {
    store,
    showForm,
    setShowForm,
    showScan,
    showGroup,
    setShowGroup,
    selectedItem,
    setSelectedItem,
    waStatus,
    whatsappConsoleRef,
    onCloseModal,
    handleEdit,
    handleScan,
    handleConsole,
    handleDelete,
    handleLogout,
    handleRestart,
    handleUpdate,
    handleAfterScan,
    nodeHandlers,
    cloneForm,
  } = useWhatsappNodePanelState();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <WhatsappNodeForm
        show={showForm}
        onClose={onCloseModal}
        selectedItem={selectedItem}
        isClone={cloneForm.value}
        onRemove={() => {
          const item = selectedItem;
          onCloseModal(false); // disable prefetch
          handleDelete(item);
        }}
      />
      <WhatsappNodeScanModal
        show={showScan}
        onClose={onCloseModal}
        onSuccess={handleAfterScan}
        onLogout={() => handleLogout(selectedItem)}
        selectedItem={selectedItem}
      />
      <Dialog
        open={showGroup}
        onClose={() => setShowGroup(false)}
        fullWidth
        className="tw-w-full tw-justify-self-center"
        scroll="paper"
      >
        <DialogContent>
          <div className="tw-py-8">
            <WhatsAppGroupPanel />
          </div>
        </DialogContent>
      </Dialog>
      <div className="tw-flex tw-flex-col lg:tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2 tw-px-2">
        <Grid container spacing={2} className="tw-w-full">
          <Grid xs={12} md={9} item>
            <span className="tw-text-lg tw-font-semibold">Pengaturan Whatsapp</span>
          </Grid>
          <Grid xs={12} md={3} item className="tw-flex tw-items-center tw-space-x-2 tw-justify-end">
            <Button
              onClick={() => {
                setShowGroup(true);
              }}
              variant="contained"
              color="info"
              className="tw-self-end"
            >
              <Icon icon="uil:setting" fontSize={20} /> {!isMobile && 'Set Kategori'}
            </Button>
            <Button
              onClick={() => {
                setSelectedItem(null);
                setShowForm(true);
                cloneForm.onTrue();
              }}
              variant="contained"
              color="success"
              className="tw-self-end"
            >
              <Icon icon="ic:baseline-plus" fontSize={20} /> {!isMobile && 'Node'}
            </Button>
          </Grid>
        </Grid>
      </div>
      <div className="tw-flex tw-flex-col tw-mt-4 tw-w-full tw-space-y-4">
        <Overloading loading={store.loading} />

        {isMobile ? (
          store.whatsappNodes.map((item, i) => (
            <WhatsappNodeMobileCard
              key={i}
              data={item}
              onScan={() => handleScan(item)}
              onEdit={() => handleEdit(item)}
              onUpdate={() => handleUpdate(item)}
              onRestart={() => handleRestart(item)}
              onRemove={() => handleDelete(item)}
              onLogout={() => handleLogout(item)}
              onConsole={() => handleConsole(item)}
            />
          ))
        ) : (
          <WhatsappNodeTable
            nodes={store.whatsappNodes}
            waStatus={waStatus}
            handlers={nodeHandlers}
          />
        )}
      </div>
      <WhatsappConsoleDialog ref={whatsappConsoleRef} />
    </>
  );
}
