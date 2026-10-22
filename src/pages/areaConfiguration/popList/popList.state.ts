// @ts-nocheck
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { setPopListStore } from 'src/stores/popListStore';
import { areaRepository, customerRepository, broadcastTemplateRepository } from 'src/repositories';
import { useGenerateMassBilling } from 'src/globalComponents/massBillingGenerate/MassBillingGenerateProvider';

/**
 * @typedef {import('@/repositories/area').GetAllAreaWithCategory} GetAllAreaWithCategory
 */

/**
 * Custom hook for PopList page state management and business logic
 * @param {Object} params
 * @param {Array<GetAllAreaWithCategory>} params.pop - List of POPs from store
 * @param {string} params.search - Search query from store
 * @param {string} params.order - Order direction from store
 * @param {string} params.orderBy - Order by field from store
 * @returns {Object} State and methods for PopList component
 */
export const usePopListState = ({ pop, search, order, orderBy }) => {
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const loading = useBoolean(false);
  const showFormArea = useBoolean(false);
  const showBroadcastForm = useBoolean(false);
  const showCustomerDialog = useBoolean(false);
  const broadcastFormRef = useRef();
  const massIsolateDialogRef = useRef();
  const migrationDialogRef = useRef();
  const serverFormDialogNextRef = useRef();
  const rewritePPPoEDialogRef = useRef();
  const generateMassBilling = useGenerateMassBilling();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPop, setSelectedPop] = useState(null);

  const open = Boolean(anchorEl);

  // Debounced search handler
  const debounceSearch = useDebouncedCallback((text) => {
    dispatch(setPopListStore({ key: 'search', value: text }));
  }, 500);

  // Fetch all POPs
  async function prefetch() {
    loading.onTrue();
    try {
      const snapshot = await areaRepository.getAllAreaWithCategory({ search, order, orderBy });
      dispatch(setPopListStore({ key: 'pop', value: snapshot }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  // Menu handlers
  const handleClick = (event, p) => {
    setAnchorEl(event.currentTarget);
    setSelectedPop(p);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedPop(null);
  };

  /**
   * Submit area form data
   * @param {Object} data - Area form data
   */
  async function onSubmitArea(data) {
    try {
      showFormArea.onFalse();
      data.id = selectedPop._id;
      data.category = selectedPop.id ?? selectedPop._id;
      data.autoIsolirDate =
        data.autoIsolirDate == null || data.autoIsolirDate === 0 ? null : data.autoIsolirDate;
      const result = await areaRepository.submitArea(data);
      if (data.companyLogo) {
        await areaRepository.submitLogoArea(result._id, data.companyLogo);
      }
      toast.info('Berhasil menyimpan');

      prefetch();
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Generate customer IDs automatically
  async function onGenerateIdCustomer() {
    try {
      await confirm({
        title: 'Generate Customer ID',
        content: `apakah anda melakukan generate ID Customer otomatis untuk area ${selectedPop?.title}`,
        confirmationText: 'Ya',
        cancellationText: 'Batal',
      });

      const result = await customerRepository.FillCustomerId(selectedPop.id ?? selectedPop._id);

      toast.success(result);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  }

  // Open migration package dialog
  async function onMigrationPackageBatch() {
    await migrationDialogRef.current.open(selectedPop.id ?? selectedPop._id);
    handleClose();
  }

  /**
   * Handle broadcast message submission
   * @param {Object} data - Broadcast data
   */
  async function onHandlerBroadcast(data) {
    data.area = selectedPop.id ?? selectedPop._id;
    try {
      showBroadcastForm.onFalse();
      await confirm({
        title: 'Konfirmasi',
        content: 'Apakah anda ingin melanjutkan broadcast pesan',
        confirmationText: 'Ya',
        cancellationText: 'Tidak',
      });

      await broadcastTemplateRepository.broadcastMessage(data);
      toast.info('Sukses melakukan broadcast');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  }

  // Open mass isolate dialog
  async function onIsolate() {
    await massIsolateDialogRef.current.open(selectedPop._id);
    handleClose();
  }

  // Batch rewrite PPPoE for all customers
  const onBatchRewritePPPoE = async () => {
    try {
      await confirm({
        title: 'Tulis Ulang PPPoE',
        content: 'Apakah anda ingin melanjutkan menulis ulang PPPoE seluruh pelanggan ke mikrotik',
        confirmationText: 'Ya',
        cancellationText: 'Tidak',
      });

      await areaRepository.batchRewritePPPoE(selectedPop.id ?? selectedPop._id);
      toast.info('Memproses ke Mikrotik');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      handleClose();
    }
  };

  /**
   * @param {GetAllAreaWithCategory} item
   */
  function massBillingGenerate(item) {
    generateMassBilling.generate({
      id: item._id,
      title: item.title,
    });
    handleClose();
  }

  // Show broadcast form dialog
  function showBroadcastFormDialog() {
    broadcastFormRef.current.open({
      id: selectedPop.id ?? selectedPop._id,
      name: selectedPop.title,
    });
    handleClose();
  }

  async function duplicateArea() {
    const id = selectedPop.id ?? selectedPop._id;
    await serverFormDialogNextRef.current.open(id, true);
    prefetch();
  }

  function rewritePPPoE() {
    rewritePPPoEDialogRef.current.open(selectedPop);
    handleClose();
  }

  // Effect to refetch data when search/order params change
  useEffect(() => {
    prefetch();
  }, [search, order, orderBy]);

  return {
    // State
    loading,
    showFormArea,
    showBroadcastForm,
    showCustomerDialog,
    anchorEl,
    open,
    selectedPop,

    // Refs
    broadcastFormRef,
    massIsolateDialogRef,
    migrationDialogRef,
    serverFormDialogNextRef,
    rewritePPPoEDialogRef,

    // Methods
    debounceSearch,
    handleClick,
    handleClose,
    onSubmitArea,
    onGenerateIdCustomer,
    onMigrationPackageBatch,
    onHandlerBroadcast,
    onIsolate,
    onBatchRewritePPPoE,
    showBroadcastFormDialog,
    prefetch,
    duplicateArea,
    rewritePPPoE,
    massBillingGenerate
  };
};
