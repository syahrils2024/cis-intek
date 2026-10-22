import { forwardRef, useImperativeHandle } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { Stack, Button, MenuItem, TextField } from '@mui/material';

/**
 * @typedef {Object} NotificationData
 * @property {string} category
 * @property {string} hooksUrl
 * @property {string} targetJid
 */

const AddAreaDialogNotificationForm = forwardRef(({ items, setItems }, ref) => {
  /**
   * @type {[NotificationData[], void]}
   */

  const optionList = [
    {
      label: 'LAPORAN HARIAN PEMBAYARAN',
      value: 'daily_billing',
    },
  ];

  function add() {
    setItems((state) => [...state, { category: '', hooksUrl: '', targetJid: '' }]);
  }

  function remove(index) {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  }

  function setStateData(index, { category, hooksUrl, targetJid }) {
    const copy = [...items];
    if (typeof category === 'string') copy[index].category = category;
    if (typeof hooksUrl === 'string') copy[index].hooksUrl = hooksUrl;
    if (typeof targetJid === 'string') copy[index].targetJid = targetJid;
    setItems(copy);
  }

  function getData() {
    return items;
  }

  function getDataAndValidate() {
    items.forEach((item, i) => {
      if (!item.category.trim()) throw new Error(`Lengkapi kategori No. ${i + 1}`);
      if (!item.hooksUrl.trim()) throw new Error(`Lengkapi hooksUrl No. ${i + 1}`);
      if (!item.targetJid.trim()) throw new Error(`Lengkapi Group Whatsapp No. ${i + 1}`);
    });

    const trimData = items.map((item) => ({
      category: item.category.trim(),
      hooksUrl: item.hooksUrl.trim(),
      targetJid: item.targetJid.trim(),
    }));

    return trimData;
  }

  function setItemData(notifications) {
    setItems(notifications);
  }

  useImperativeHandle(ref, () => ({ getData, getDataAndValidate, setItemData }));

  return (
    <Stack spacing={2}>
      {items.map((item, i) => (
        <div className="tw-px-3 tw-py-6 tw-ring-1 tw-ring-gray-400 tw-rounded-lg" key={i}>
          <Stack>
            <Grid container gap={2}>
              <Grid xs={12} md={6}>
                <TextField
                  label="Hooks Url"
                  size="small"
                  fullWidth
                  value={items[i].hooksUrl}
                  onChange={(e) => setStateData(i, { hooksUrl: e.target.value })}
                />
              </Grid>
              <Grid xs={12} md={5.5}>
                <TextField
                  label="Whatsapp Group Chat ID"
                  size="small"
                  fullWidth
                  value={items[i].targetJid}
                  onChange={(e) => setStateData(i, { targetJid: e.target.value })}
                />
              </Grid>
              <Grid xs={12} md={9.5}>
                <TextField
                  label="Kategori"
                  size="small"
                  fullWidth
                  select
                  value={items[i].category}
                  onChange={(e) => setStateData(i, { category: e.target.value })}
                >
                  {optionList.map((ol, j) => (
                    <MenuItem key={j} value={ol.value}>
                      {ol.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} md={2}>
                <Button variant="outlined" color="error" fullWidth onClick={() => remove(i)}>
                  Hapus
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </div>
      ))}
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-end">
        <Button variant="outlined" color="success" onClick={() => add()}>
          + Tambah
        </Button>
      </div>
    </Stack>
  );
});

export default AddAreaDialogNotificationForm;
