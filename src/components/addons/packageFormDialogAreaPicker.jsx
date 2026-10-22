import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';
import { useRef, useMemo, useState, forwardRef, useImperativeHandle } from 'react';

import {
  Button,
  Dialog,
  useTheme,
  Checkbox,
  Accordion,
  DialogTitle,
  DialogActions,
  useMediaQuery,
  DialogContent,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
} from '@mui/material';

import { areaRepository } from 'src/repositories';

/**
 * @typedef {Object} AreaResult
 * @property {string} _id
 * @property {string} title
 */

/**
 * @typedef {import('src/repositories/area').Area} Area
 */

const PackageFormDialogAreaPicker = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [excludes, setExcludes] = useState([]);
  const [picks, setPicks] = useState([]);
  const show = useBoolean(false);
  const loading = useBoolean(false);
  const resolver = useRef();
  const [search, setSearch] = useState('');
  const expanded = useExpansionToggle();

  /** @type {[Area[], (a: Area[]) => void]} */
  const [areaList, setArea] = useState([]);

  function togglePick(areaId) {
    const copy = [...picks];
    const exists = copy.indexOf(areaId);
    if (exists === -1) {
      copy.push(areaId);
    } else {
      copy.splice(exists, 1);
    }

    setPicks(copy);
  }

  function toggleCheckCategory(isChecked, areaCategoryId) {
    const copy = [...picks];
    const area = filteredItem.find((item) => item._id === areaCategoryId);
    if (!area) return;
    const snapshotIds = area.area.map((a) => a._id);
    if (isChecked) {
      /**
       * Add all items of area category
       */
      copy.push(...snapshotIds);
      const clean = [...new Set(copy)];
      setPicks(clean);
    } else {
      /**
       * Remove all items of area category
       */
      snapshotIds.forEach((areaId) => {
        const index = copy.indexOf(areaId);
        if (index !== -1) {
          copy.splice(index, 1);
        }
      });
      setPicks(copy);
    }
  }

  const filteredItem = useMemo(() => {
    const s = search.toLowerCase();
    const copyArea = JSON.parse(JSON.stringify(areaList));
    const items = [];
    copyArea.forEach((category) => {
      const areaItem = category.area.filter((a) => !excludes.includes(a._id));
      // console.log({areaItem})
      // const isCategory = category.title.toLowerCase().includes(s);
      // if (isCategory) {
      //   items.push(category);
      //   return;
      // }
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

  function reset() {
    setExcludes([]);
    setPicks([]);
  }

  function open({ excludesIds, includeIds }) {
    reset();
    expanded.reset();
    setExcludes(excludesIds ?? []);
    setPicks(includeIds ?? []);
    show.onTrue();
    prefetchArea();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function submit() {
    const resultItems = picks
      .map((p) => filteredItem.map((fi) => fi.area.filter((a) => a._id === p)))
      .flat(2);
    if (resultItems.length <= 0) {
      toast.error('Pilih minimal 1 area');
      return;
    }

    const result = resultItems.map((item) => ({ _id: item._id, title: item.title }));
    resolver.current(result);
    show.onFalse();
  }

  function close() {
    show.onFalse();
    resolver.current();
  }

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Pilih Area</DialogTitle>
      <DialogContent>
        <div className="tw-flex tw-flex-col tw-py-2 tw-gap-2">
          {filteredItem.map((item, i) => (
            <div key={i} className="tw-ring-1 tw-ring-gray-400 tw-rounded tw-w-full">
              <Accordion>
                <AccordionSummary>
                  <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full">
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={(e) => toggleCheckCategory(e.target.checked, item._id)}
                        />
                      }
                      label={<span className="tw-text-xs">{item.title}</span>}
                    />
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="tw-flex tw-flex-col tw-gap-2">
                    {item.area.map((area, j) => (
                      <div key={j} className="tw-flex tw-flex-row tw-justify-start tw-items-center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={picks.includes(area._id)}
                              onClick={() => togglePick(area._id)}
                            />
                          }
                          label={<span className="tw-text-xs">{area.title}</span>}
                        />
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
        <Button color="error" variant="text" onClick={() => close()}>
          Tutup
        </Button>
        <Button color="primary" variant="contained" onClick={() => submit()}>
          Pilih
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default PackageFormDialogAreaPicker;
