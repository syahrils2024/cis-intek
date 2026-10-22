import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';

import {
  Grid,
  Stack,
  Table,
  Button,
  useTheme,
  TableRow,
  Accordion,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  useMediaQuery,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import { whatsappGroupRepository } from 'src/repositories';

import WhatsappGroupForm from '../forms/whatsappGroupForm';
import useWhatsappSettingStore from '../whatsappSetting.store';

const MobileSection = ({ data, onEdit, allowEdit, onRemove, allowRemove = true }) => (
  <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
    <Accordion>
      <AccordionSummary>
        <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
          <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-start tw-w-full tw-gap-2">
            {data.name}
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className="tw-flex tw-flex-col tw-gap-2">
          <Stack>
            <span className="tw-text-xs tw-text-gray-500">Nama Kategori</span>
            <span className="tw-text-xs tw-font-medium">{data.name}</span>
          </Stack>
        </div>
      </AccordionDetails>
      <AccordionActions>
        <Button disabled={!allowRemove} variant="soft" color="error" onClick={onRemove}>
          <Icon icon="material-symbols:remove-outline" className="tw-mr-2" />
          Hapus
        </Button>
        <Button disabled={!allowEdit} variant="soft" color="info" onClick={onEdit}>
          <Icon icon="material-symbols:edit-outline" className="tw-mr-2" />
          Edit
        </Button>
      </AccordionActions>
    </Accordion>
  </div>
);

export default function WhatsAppGroupPanel() {
  const store = useWhatsappSettingStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const confirm = useConfirm();

  useEffect(() => {
    store.fetchWhatsappGroups();
  }, []);

  const onCloseForm = () => {
    setShowForm(false);
    store.fetchWhatsappGroups();
  };

  async function deleteWhatsappGroup(item) {
    try {
      await confirm({
        title: 'Hapus Whatsapp Group',
        description: `Apakah anda ingin menghapus group ${item.name}`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });

      await whatsappGroupRepository.deleteWhatsappGroup(item._id);
      store.fetchWhatsappGroups();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  return (
    <>
      <WhatsappGroupForm show={showForm} onClose={onCloseForm} selectedItem={selectedItem} />
      <div className="tw-flex tw-flex-col lg:tw-flex-row tw-w-full tw-items-center tw-justify-between tw-gap-2 tw-px-2">
        <Grid container spacing={2} className="tw-w-full">
          <Grid xs={9} item>
            <Typography variant="h5">Kategori</Typography>
          </Grid>
          <Grid xs={3} item className="tw-flex tw-items-center tw-justify-end">
            <Button
              onClick={() => {
                setSelectedItem(null);
                setShowForm(true);
              }}
              variant="contained"
              color="success"
              className="tw-self-end"
            >
              <Icon icon="ic:baseline-plus" fontSize={20} />
            </Button>
          </Grid>
        </Grid>
      </div>
      <div className="tw-flex tw-flex-col tw-mt-4 tw-space-y-4">
        <Overloading loading={store.loading} />

        {isMobile ? (
          store.whatsappGroups.map((item, i) => (
            <MobileSection
              key={i}
              data={item}
              onEdit={() => {
                setSelectedItem(item);
                setShowForm(true);
              }}
              allowEdit
              onRemove={() => deleteWhatsappGroup(item)}
              allowRemove
            />
          ))
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Nama Kategori</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {store.whatsappGroups.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="soft"
                        color="info"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowForm(true);
                        }}
                      >
                        <Icon icon="material-symbols:edit-outline" className="tw-mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="soft"
                        color="error"
                        onClick={() => deleteWhatsappGroup(item)}
                      >
                        <Icon icon="material-symbols:remove-outline" className="tw-mr-2" />
                        Hapus
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
