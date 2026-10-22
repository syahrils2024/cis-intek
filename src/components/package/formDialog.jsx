// import { z } from 'zod';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Dialog,
  Button,
  Divider,
  MenuItem,
  useTheme,
  TextField,
  Typography,
  DialogTitle,
  // FormControl,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';
import { areaRepository, packagePlanRepository } from 'src/repositories';
import {
  setArea,
  upsertPppoe,
  setPricePppoeItems,
  setSelectedPppoeProfile,
} from 'src/stores/areaStore';
/**
 * @typedef {import('src/stores/areaStore').AreaStore} AreaStore
 * @typedef {import('src/stores/customerFormStore').Package} Package
 */

/**
 * @param {{open: boolean; onClose: void}} props - Package Form Dialog Props
 */

// const formSchema = z.object({
//   name: z.string(),
// });

/**
 *
 * @param {AreaStore} state
 * @param {string} key
 */
const findPppoe = (state, key) => {
  const result = state.pppoeItems.find((p) => p.key === key)?.items ?? [];
  return result;
};

/**
 * @param {{open: boolean; onClose: void; selectedItem:Package}} props -- react props
 * @returns
 */
export default function PackageFormDialog({ open, onClose, selectedItem }) {
  const [packageName, setPackageName] = useState('');
  const [status, setStatus] = useState('');

  const theme = useTheme();
  const dispatch = useDispatch();
  const loading = useBoolean(false);
  const [statusList] = useState([
    { label: 'Aktif', value: 'active' },
    { label: 'Tidak Aktif', value: 'inactive' },
  ]);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [disconnectedId, setDisconnectedId] = useState([]);

  /**
   * @type {AreaStore}
   */
  const area = useSelector((state) => state.areaStore);

  const prefetch = async () => {
    // if (area.all.length !== 0 && area.pppoeItems.length !== 0) return;

    try {
      loading.onTrue();
      const snapshotArea = await areaRepository.getAllArea();
      const mapSnapshotArea = snapshotArea.map((a) => {
        const all = a.area.map((a2) => ({ ...a2, profile: 'default', price: 0, loading: true }));
        a.area = all;
        return a;
      });

      if (selectedItem) {
        const snapshotPackage = await packagePlanRepository
          .getSomePackage(selectedItem.id ?? selectedItem._id)
          .catch((err) => {
            toast.error(err.message);
            return undefined;
          });
        setPackageName(snapshotPackage?.title ?? '');
        setStatus(snapshotPackage?.status ?? '');
        mapSnapshotArea.forEach((a, i) => {
          a.area.forEach((a2, j) => {
            const exist = snapshotPackage?.prices.find((p) => p.area === a2._id);
            if (exist) {
              mapSnapshotArea[i].area[j].price = exist.price.toString().toNumber().formatCurrency();
              mapSnapshotArea[i].area[j].profile = exist.pppoeProfile;
            }
          });
        });
      }
      dispatch(setArea(mapSnapshotArea));

      const uniqueAreaChildren = [
        ...new Set(
          snapshotArea
            .map((item) => item.area)
            .reduce((a, b) => [...a, ...b])
            .map((item) => item._id)
        ),
      ];

      const snapshotDisconnectedId = await Promise.all(
        uniqueAreaChildren.map(async (ppoe) => {
          const snapshot = await areaRepository.getPppoeProfile(ppoe).catch(() => undefined);
          if (!snapshot) return ppoe;
          dispatch(upsertPppoe({ key: ppoe, items: snapshot, price: 0, profile: 'default' }));
          return 1;
        })
      );

      setDisconnectedId(snapshotDisconnectedId.filter((d) => typeof d === 'string'));
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  const onSubmit = async () => {
    loading.onTrue();
    try {
      if (packageName === '') throw new Error('Nama Paket harus diisi!');
      if (status === '') throw new Error('Status harus diisi!');

      /** @type {Array<{ area: string; price: number; pppoeProfile: string }>} */
      const items = area.all
        .map((a) => {
          /** @type {Array<{ area: string; price: number; pppoeProfile: string }>} */
          const subItems = a.area.map((a2, j) => {
            const price = a2.price.toString().toNumber();
            return {
              area: a2._id,
              pppoeProfile: a2.profile,
              price,
            };
          });

          return subItems;
        })
        .reduce((a, b) => [...a, ...b]);

      await packagePlanRepository.submitPackage({
        _id: selectedItem?.id ?? selectedItem?._id ?? undefined,
        title: packageName,
        status,
        price: items,
      });
      onClose(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  useEffect(() => {
    if (open) {
      setDisconnectedId([]);
      prefetch();
    }
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll="paper"
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ pb: 2 }}>Form Paket</DialogTitle>

      <DialogContent dividers className="tw-relative">
        {/* <Overloading loading={loading.value} /> */}
        <>
          {/* <FormControl size="small" fullWidth> */}
          <Stack spacing={2} className="tw-p-3">
            <TextField
              value={packageName}
              label="Nama Paket"
              id="nama.paket"
              size="small"
              onChange={(e) => setPackageName(e.target.value)}
            />
            <TextField
              select
              value={status}
              label="Status"
              id="nama.paket"
              size="small"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem disabled value="">
                Pilih Status
              </MenuItem>
              {statusList.map((s, i) => (
                <MenuItem key={i} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
            {/* <Select label="Status" labelId="status" className="tw-text-black">
            {statusList.map((s, i) => (
              <MenuItem key={i} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select> */}
            <Typography className="tw-mb-3">Area</Typography>
            {area.all.length > 0 &&
              area.all.map((a, i) => (
                <div key={i}>
                  <Divider />
                  <Typography className="tw-pt-3">{a.title}</Typography>
                  <div className="tw-flex tw-flex-col tw-mt-4 tw-pl-5 tw-gap-3">
                    {a.area.map((a2, j) => (
                      <Stack spacing={1} key={j} className="tw-pl-3 tw-pt-1 tw-relative">
                        {/* <Typography>{a2.title}</Typography> */}
                        {/* <Overloading loading={a2.loading} /> */}
                        <Typography>{area.all[i].area[j]?.title ?? ''}</Typography>
                        <Grid container spacing={1}>
                          <Grid xs={12} lg={6}>
                            <Stack spacing={0.5}>
                              <span className="tw-text-xs">Profile</span>
                              <TextField
                                select
                                className="tw-w-full"
                                size="small"
                                variant="outlined"
                                value={area.all[i].area[j].profile}
                                onChange={(e) =>
                                  dispatch(
                                    setSelectedPppoeProfile({
                                      index: j,
                                      parentIndex: i,
                                      profile: e.target.value,
                                    })
                                  )
                                }
                              >
                                <MenuItem disabled value="">
                                  Pilih Profil
                                </MenuItem>
                                {findPppoe(area, a2._id).map((item, k) => (
                                  <MenuItem key={k} value={item.name}>
                                    {item.name}
                                  </MenuItem>
                                ))}
                              </TextField>
                              {disconnectedId.includes(a2._id) && (
                                <span className="tw-text-xs tw-text-red-500">
                                  Tidak dapat terhubung ke mikrotik
                                </span>
                              )}
                            </Stack>
                          </Grid>
                          <Grid xs={12} lg={6}>
                            <Stack spacing={0.5}>
                              <span className="tw-text-xs">Harga</span>
                              <TextField
                                size="small"
                                variant="outlined"
                                fullWidth
                                value={area.all[i].area[j].price}
                                onChange={(e) =>
                                  dispatch(
                                    setPricePppoeItems({
                                      index: j,
                                      parentIndex: i,
                                      price: e.target.value.toString().toNumber().formatCurrency(),
                                    })
                                  )
                                }
                              />
                            </Stack>
                          </Grid>
                        </Grid>
                      </Stack>
                    ))}
                  </div>
                </div>
              ))}
          </Stack>
          {/* </FormControl> */}
        </>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button variant="contained" onClick={onSubmit}>
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
  // return (
  //   <Dialog open={open} onClose={onClose} scroll="paper">
  //     <DialogTitle sx={{ pb: 2 }}>Form Package</DialogTitle>
  //     <DialogContent dividers>
  //       <Stack spacing={3}>
  //         <TextField label="Nama Paket" id="nama.paket" />
  //       </Stack>
  //     </DialogContent>
  //     <DialogActions>
  //       <Button onClick={onClose} color="red">
  //         Cancel
  //       </Button>
  //     </DialogActions>
  //   </Dialog>
  // );
}
