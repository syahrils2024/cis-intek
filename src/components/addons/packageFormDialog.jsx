import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Chip,
  Stack,
  Dialog,
  Button,
  useTheme,
  MenuItem,
  TextField,
  IconButton,
  DialogTitle,
  useMediaQuery,
  DialogActions,
  DialogContent,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';
import { addonsRepository } from 'src/repositories';
import { useAddonsCategory } from 'src/stores/addonsCategory';

import PackageFormDialogAreaPicker from './packageFormDialogAreaPicker';

/**
 * @typedef {import('src/stores/addonsCategory').AddonsCategoryStore} AddonsCategoryStore
 */

/**
 * @typedef {Object} AddonsPackageData
 * @property {number} price
 * @property {{title: string; _id: string}[]} area
 */

const validator = z.object({
  category: z.string().min(1, 'tidak boleh kosong'),
  variantName: z.string().min(1, 'harus diisi'),
});

const AddonsPackageFormDialog = forwardRef((props, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const show = useBoolean(false);
  const resolver = useRef();
  const isLoading = useBoolean(false);
  const pickAreaRef = useRef();
  const [currentId, setCurrentId] = useState(null);
  const duplicate = useBoolean(false);

  /** @type {AddonsCategoryStore} */
  const { data: categories, setData: setCategories } = useAddonsCategory();

  const defaultValues = {
    category: '',
    variantName: '',
  };

  const methods = useForm({ defaultValues, resolver: zodResolver(validator) });
  const { handleSubmit } = methods;

  /** @type {[AddonsPackageData[], void]} */
  const [data, setData] = useState([
    {
      price: '0',
      variantName: '',
      area: [],
    },
  ]);

  /**
   * Set Price form data
   * @param {string} value
   * @param {number} index
   */
  function setPrice(value, index) {
    const copy = [...data];
    copy[index].price = value.toNumber().formatCurrency();
    setData(copy);
  }

  /**
   * Remove Price Item
   * @param {number} index
   */
  function removePriceItem(index) {
    const copy = [...data];
    copy.splice(index, 1);
    setData(copy);
  }

  /**
   * Add Price Item
   */
  function addPriceItem() {
    const copy = [...data];
    copy.push({
      price: '0',
      area: [],
    });
    setData(copy);
  }

  function removeAreaItem(index, indexArea) {
    const copy = [...data];
    data[index].area.splice(indexArea, 1);
    setData(copy);
  }

  async function prefetchCategory() {
    isLoading.onTrue();
    try {
      const snapshot = await addonsRepository.getAddonsCategoryList();
      setCategories(snapshot);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  }

  async function getDetail(id, isDuplicate = false) {
    setCurrentId(id);
    try {
      const snapshot = await addonsRepository.detailAddons(id);
      const priceList = [...new Set(snapshot.areas.map((a) => a.price))];
      const areaPriceList = priceList.map((price) => {
        const areaList = snapshot.areas.filter((a) => a.price === price);
        const areaItems = areaList.map((a) => ({ _id: a.areaId, title: a.areaTitle }));
        return {
          price: price.formatCurrency(),
          area: areaItems,
        };
      });

      setData(areaPriceList);

      methods.setValue('category', snapshot.categoryId);
      methods.setValue('variantName', isDuplicate ? `${snapshot.variantName} (Duplicate)` : snapshot.variantName);
    } catch (error) {
      toast.error(error.message);
    }
  }

  function open(id, isDuplicate = false) {
    duplicate.setValue(isDuplicate);
    setCurrentId(null);
    methods.reset();
    setData([]);
    show.onTrue();
    if (categories.length <= 0) prefetchCategory();
    if (id) getDetail(id, isDuplicate);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function close() {
    show.onFalse();
    resolver.current();
  }

  async function pickArea(index) {
    const copy = [...data];
    const includeIds = copy[index].area.map((a) => a._id);
    const excludesIds = copy.flatMap((item, i) => {
      if (i === index) return [];
      return item.area.map((d) => d._id);
    });

    const result = await pickAreaRef.current.open({ includeIds, excludesIds });
    if (!result) return;
    copy[index].area = result;
    setData(copy);
  }

  function clearArea(index) {
    const copy = [...data];
    copy[index].area = [];
    setData(copy);
  }

  function validateBeforeSubmit() {
    data.forEach((d, i) => {
      const price = d.price.toString().toNumber();
      if (price <= 0) throw new Error(`Lengkapi harga pada item ${i + 1}`);
      if (d.area.length <= 0) throw new Error(`Lengkapi area pada item ${i + 1}`);
    });
  }

  const submit = handleSubmit(async (d) => {
    isLoading.onTrue();
    try {
      validateBeforeSubmit();

      const items = data.map((_d) => ({
        price: _d.price.toNumber(),
        area: _d.area.map((a) => a._id),
      }));

      const isUpdate = currentId && !duplicate.value;

      if (isUpdate) {
        await addonsRepository.updateAddons(currentId, {
          category: d.category,
          variantName: d.variantName,
          areas: items,
        });
      } else {
        await addonsRepository.createAddons({
          category: d.category,
          variantName: d.variantName,
          areas: items,
        });
      }

      toast.success('Berhasil menyimpan');
      close();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      isLoading.onFalse();
    }
  });

  useImperativeHandle(ref, () => ({ open }));

  return (
    <>
      <Dialog open={show.value} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Addons Form</DialogTitle>
        <DialogContent>
          <Form methods={methods}>
            <div className="tw-flex tw-flex-col tw-relative tw-py-2 tw-gap-3">
              <Overloading loading={isLoading.value} />
              <Field.Select name="category" label="Kategori" variant="outlined" size="small">
                {categories.map((c, i) => (
                  <MenuItem value={c._id} key={i}>
                    {c.category}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.Text name="variantName" label="Nama Variant" variant="outlined" size="small" />
              <span className="tw-text-gray-500 tw-text-xs tw-my-4">Item</span>
              <Stack spacing={2}>
                {data.map((d, i) => (
                  <div
                    className="tw-flex tw-flex-col tw-ring-1 tw-ring-gray-400 tw-p-5 tw-rounded-lg"
                    key={i}
                  >
                    <span className="tw-text-xs tw-mb-1">Harga</span>
                    <Stack direction="row" justifyContent="end" spacing={1}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={d.price}
                        onChange={(e) => setPrice(e.target.value, i)}
                        size="small"
                      />
                      {data.length > 1 && (
                        <IconButton color="error" onClick={() => removePriceItem(i)} size="small">
                          <Iconify icon="mdi:minus" />
                        </IconButton>
                      )}
                    </Stack>
                    <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-2">
                      {d.area.map((a, j) => (
                        <Chip
                          key={j}
                          label={
                            <div className="tw-flex tw-flex-row tw-gap-1 tw-text-xs tw-items-center">
                              {a.title}
                              <button type="button" onClick={() => removeAreaItem(i, j)}>
                                <Iconify icon="mdi:close" />
                              </button>
                            </div>
                          }
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </div>
                    <Stack direction="row" justifyContent="end" className="tw-mt-2">
                      {d.area.length >= 1 && (
                        <Button
                          color="error"
                          variant="text"
                          onClick={() => clearArea(i)}
                          size="small"
                        >
                          Clear Area
                        </Button>
                      )}

                      <Button
                        color="success"
                        variant="text"
                        onClick={() => pickArea(i)}
                        size="small"
                      >
                        + Area
                      </Button>
                    </Stack>
                  </div>
                ))}
                <Stack direction="row" justifyContent="end" className="tw-mt-2">
                  <Button
                    color="success"
                    variant="outlined"
                    onClick={() => addPriceItem()}
                    size="small"
                  >
                    + Item
                  </Button>
                </Stack>
              </Stack>
            </div>
          </Form>
        </DialogContent>
        <DialogActions>
          <Button color="error" variant="text" onClick={() => close()}>
            Tutup
          </Button>
          <LoadingButton
            loading={isLoading.value}
            color="primary"
            variant="contained"
            onClick={submit}
          >
            Simpan
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <PackageFormDialogAreaPicker ref={pickAreaRef} />
    </>
  );
});

export default AddonsPackageFormDialog;
