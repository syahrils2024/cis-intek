import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useState, useEffect } from 'react';

import { whatsappNodeRepository } from 'src/repositories';

import useWhatsappSettingStore from '../whatsappSetting.store';

export default function useWhatsappNodePanelState() {
  const store = useWhatsappSettingStore();
  const [showForm, setShowForm] = useState(false);
  const cloneForm = useBoolean(false);
  const [showScan, setShowScan] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [waStatus, setWaStatus] = useState([]);
  const confirm = useConfirm();
  const whatsappConsoleRef = useRef();

  useEffect(() => {
    store.fetchWhatsappNodes();
    store.fetchWhatsappGroups();
  }, []);

  useEffect(() => {
    if (store.whatsappNodes.length > 0) {
      getWhatsappStatus(store.whatsappNodes.map((item) => item._id));
    }
  }, [store.whatsappNodes.length]);

  const getWhatsappStatus = async (data) => {
    try {
      const response = await whatsappNodeRepository.getWhatsappNodeStatus(data);
      setWaStatus(response);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const refreshWhatsappStatus = () => {
    if (store.whatsappNodes.length > 0) {
      getWhatsappStatus(store.whatsappNodes.map((i) => i._id));
    }
  };

  const onCloseModal = (prefetch = true) => {
    setShowForm(false);
    setShowScan(false);
    if (prefetch) store.fetchWhatsappNodes();
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowForm(true);
    cloneForm.onFalse();
  };

  const handleClone = (item) => {
    cloneForm.onTrue();
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleScan = (item) => {
    setSelectedItem(item);
    setShowScan(true);
  };

  const handleConsole = (item) => {
    whatsappConsoleRef.current.open(item);
  };

  const handleDelete = async (item) => {
    try {
      await confirm({
        title: 'Hapus Whatsapp Node',
        description: `Apakah anda ingin menghapus node ${item.title}`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });

      await whatsappNodeRepository.deleteWhatsappNode(item._id);
      store.fetchWhatsappNodes();
      toast.success('Berhasil menghapus node');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleLogout = async (item) => {
    try {
      await confirm({
        title: 'Logout Whatsapp Node',
        description: `Apakah anda ingin melakukan logout node ${item.title}`,
        confirmationText: 'Logout',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });

      await whatsappNodeRepository.clearDataWhatsappNode(item._id);
      store.fetchWhatsappNodes();
      toast.success('Berhasil melakukan logout node');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleRestart = async (item) => {
    try {
      await confirm({
        title: 'Restart Whatsapp Node',
        description: `Apakah anda ingin melakukan restart node ${item.title}`,
        confirmationText: 'Restart',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });

      await whatsappNodeRepository.restartWhatsappNode(item._id);
      store.fetchWhatsappNodes();
      toast.success('Berhasil melakukan restart');
      refreshWhatsappStatus();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleUpdate = async (item) => {
    try {
      await confirm({
        title: 'Update Whatsapp Node',
        description: `Apakah anda ingin melakukan update version whatsapp node ${item.title}`,
        confirmationText: 'Update',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });

      await whatsappNodeRepository.updateWhatsappNode(item._id);
      store.fetchWhatsappNodes();
      toast.success('Berhasil melakukan update');
      refreshWhatsappStatus();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleAfterScan = async () => {
    try {
      await confirm({
        title: 'Selesai Scan',
        description: `Apakah anda sudah selesai scan QR nomor Whatsapp ${selectedItem.title}`,
        confirmationText: 'Ya',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });

      await store.changeStatusWhatsappNode(selectedItem, 'active');
      store.fetchWhatsappNodes();
      toast.success('Berhasil melakukan scan QR');
      setShowScan(false);
      refreshWhatsappStatus();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  async function updateOnlineStatus(item, isOnline) {
    const currentOnlineStatus = item.online;
    const promises = whatsappNodeRepository.setOnlineStatus(item._id, isOnline);
    const loadingMessage = isOnline ? 'Mengaktifkan node...' : 'Menonaktifkan node...';
    toast.promise(promises, {
      loading: loadingMessage,
      success: () => {
        store.fetchWhatsappNodes();
        return `Berhasil`;
      },
      error: (e) => {
        store.changeOnlineStatus(item, currentOnlineStatus);
        return e.message;
      },
    });
  }

  const nodeHandlers = {
    onEdit: handleEdit,
    onDelete: handleDelete,
    onLogout: handleLogout,
    onScan: handleScan,
    onRestart: handleRestart,
    onUpdate: handleUpdate,
    onConsole: handleConsole,
    onChangeOnlineStatus: updateOnlineStatus,
    onClone: handleClone,
  };

  return {
    store,
    showForm,
    setShowForm,
    showScan,
    setShowScan,
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
    handleClone,
    nodeHandlers,
    cloneForm,
  };
}
