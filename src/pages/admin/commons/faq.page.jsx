import { useRef, useEffect } from 'react';
import { Iconify } from '@components/iconify';
import { useConfirm } from 'material-ui-confirm';
import Overloading from '@components/overloading';

import { Stack, Button, useTheme, useMediaQuery } from '@mui/material';

import { useFaqState } from './faq.state';
import { FaqData } from './components/FaqData';
import FaqFormDialog from './components/FaqFormDialog';

/** @typedef {import('src/repositories/faq').Faq} Faq */

export default function FaqPage() {
  const faqFormDialogRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, loading, prefetch, deleteFaq, setData, upsert } = useFaqState();
  const confirm = useConfirm();

  async function addFaq() {
    await faqFormDialogRef.current.open();
    prefetch();
  }

  async function editFaq(id) {
    await faqFormDialogRef.current.open(id);
    prefetch();
  }

  useEffect(() => {
    prefetch();
  }, []);

  return (
    <>
      <div className="tw-p-5 tw-w-full">
        <Stack className="tw-w-full" spacing={2}>
          <Stack direction={isMobile ? 'column' : 'row'} className="tw-w-full" spacing={2}>
            <Stack className="tw-w-full">
              <h1 className="tw-text-md tw-font-semibold">Faq</h1>
              <p className="tw-text-gray-600 tw-text-xs">
                halaman ini digunakan untuk mengatur pertanyaan yang sering diajukan oleh pengguna.
              </p>
            </Stack>
            <Button
              color="primary"
              variant="contained"
              className="tw-gap-2 tw-w-min tw-self-end"
              onClick={() => addFaq()}
            >
              <Iconify icon="mdi:plus" /> Tambah
            </Button>
          </Stack>
          <Stack spacing={2} className="tw-relative">
            <Overloading loading={loading.value} />
            {isMobile ? (
              <FaqData.Mobile data={data} onEdit={(faq) => editFaq(faq._id)} onRemove={deleteFaq} />
            ) : (
              <FaqData.Table data={data} onEdit={(faq) => editFaq(faq._id)} onRemove={deleteFaq} />
            )}
          </Stack>
        </Stack>
      </div>
      <FaqFormDialog ref={faqFormDialogRef} />
    </>
  );
}
