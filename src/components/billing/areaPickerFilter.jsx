/**
 * @typedef {import("src/repositories/area").Area} Area
 * @typedef {import("src/stores/areaStore").AreaStore} AreaStore
 * @typedef {import("src/stores/billingStore").BillingStore} BillingStore
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Button,
  Dialog,
  useTheme,
  TextField,
  Accordion,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { areaRepository } from 'src/repositories';

/**
 * Area Picker Filter
 * @typedef {object} AreaPickerFilterResult
 * @property {string} _id
 * @property {string} name
 */

const AreaPickerFilter = forwardRef((props, ref) => {
  const [currentSelectedArea, setCurrentSelectedArea] = useState('');
  const resolver = useRef();
  const openDialog = useBoolean(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const loading = useBoolean(false);
  const [search, setSearch] = useState('');
  const expansionToggle = useExpansionToggle();
  const showSelectAll = useBoolean(true);

  /** @type {[Area[], (a: Area[]) => void]} */
  const [areaList, setArea] = useState([]);

  const filteredItem = useMemo(() => {
    const s = search.toLowerCase();
    const copyArea = JSON.parse(JSON.stringify(areaList));
    const items = [];
    copyArea.forEach((category) => {
      const areaItem = category.area.filter((a) => a.title?.toLowerCase().includes(s));
      const isCategory = category.title.toLowerCase().includes(s);
      if (isCategory) {
        items.push(category);
        return;
      }
      if (areaItem.length <= 0) return;

      category.area = areaItem;
      items.push(category);
    });
    return items;
  });

  async function prefetchArea() {
    loading.onTrue();
    try {
      const snapshot = await areaRepository.getAllArea();
      setArea(snapshot);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mendapatkan data area');
    } finally {
      loading.onFalse();
    }
  }

  function open(selectedArea, showAll = true) {
    openDialog.onTrue();
    showSelectAll.setValue(showAll);
    if (areaList.length <= 0) prefetchArea();
    setCurrentSelectedArea(selectedArea);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  /**
   *
   * @param {AreaPickerFilterResult} data
   */
  function close(data) {
    resolver.current(data);
    openDialog.onFalse();
  }

  function getArea(id) {
    let data = null;
    const categoryExists = areaList.find((c) => c._id === id);
    if (categoryExists) data = categoryExists;

    const flatItems = areaList.flatMap((c) => c.area).find((a) => a._id === id);
    if (flatItems) data = flatItems;

    if (data) {
      return {
        _id: data._id,
        name: data.title,
        title: data.title,
        ipRemote: data.routerConfig?.address,
      };
    }

    return data;
  }

  useImperativeHandle(ref, () => ({ open, getArea }));

  return (
    <Dialog
      fullScreen={isMobile}
      open={openDialog.value}
      onClose={() => close()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Pilih Area</DialogTitle>
      <DialogContent>
        <div className="tw-py-3 tw-relative tw-gap-3 tw-flex tw-flex-col">
          <Overloading loading={loading.value} />
          <TextField
            size="small"
            label="Cari Area"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {showSelectAll.value && (
            <div className="tw-ring-1 tw-ring-gray-400 tw-rounded tw-w-full">
              <Accordion>
                <AccordionSummary>
                  <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full">
                    <span className="tw-text-xs">Semua</span>
                    <Button
                      size="small"
                      variant={currentSelectedArea === '' ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => close({ _id: '', name: 'Semua', title: 'Semua' })}
                    >
                      Pilih
                    </Button>
                  </div>
                </AccordionSummary>
              </Accordion>
            </div>
          )}

          {filteredItem.map((item, i) => (
            <div key={i} className="tw-ring-1 tw-ring-gray-400 tw-rounded tw-w-full">
              <Accordion
                expanded={expansionToggle.isIncludes(item._id)}
                onChange={() => expansionToggle.toggle(item._id)}
              >
                <AccordionSummary>
                  <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full">
                    <span className="tw-text-xs">{item.title}</span>
                    {showSelectAll.value && (
                      <Button
                        size="small"
                        variant={currentSelectedArea === item._id ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => {
                          close({
                            _id: item._id,
                            name: item.title,
                            title: item.title,
                            ipRemote: item.ipRemote,
                          });
                        }}
                      >
                        Pilih
                      </Button>
                    )}
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="tw-flex tw-flex-col tw-gap-2">
                    {item.area.map((area, j) => (
                      <div
                        key={j}
                        className="tw-flex tw-flex-row tw-items-center tw-justify-between"
                      >
                        <Button
                          size="small"
                          variant={currentSelectedArea === area._id ? 'contained' : 'outlined'}
                          onClick={() =>
                            close({
                              _id: area._id,
                              name: area.title,
                              title: area.title,
                              ipRemote: area.routerConfig?.address,
                            })
                          }
                        >
                          <span className="tw-text-xs">{area.title}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => close()}>
          Batal
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default AreaPickerFilter;
