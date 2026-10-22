/**
 * @typedef {import('src/repositories/networkMonitoringNotificationTemplate').NetworkMonitoringNotificationTemplate} NetworkMonitoringNotificationTemplate
 * @typedef {import('src/repositories/networkMonitoringNotificationTemplate').NetworkMonitoringNotificationTemplateRequest} NetworkMonitoringNotificationTemplateRequest
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useMemo, useState, useEffect } from 'react';

import {
  getNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
} from 'src/repositories/networkMonitoringNotificationTemplate';

import { filterAndSortTemplates } from './notificationTemplate.helper';

/**
 * @typedef {Object} NotificationTemplateState
 * @property {NetworkMonitoringNotificationTemplate[]} templates
 * @property {NetworkMonitoringNotificationTemplate[]} filteredTemplates
 * @property {object} loading
 * @property {string} search
 * @property {string} orderBy
 * @property {'asc'|'desc'} order
 * @property {boolean} showForm
 * @property {NetworkMonitoringNotificationTemplate|null} selectedTemplate
 */

/**
 * @typedef {Object} NotificationTemplateHandlers
 * @property {(value: string) => void} setSearch
 * @property {(key: string) => void} sort
 * @property {() => void} onAdd
 * @property {(template: NetworkMonitoringNotificationTemplate) => void} onEdit
 * @property {() => void} onClose
 * @property {() => Promise<void>} prefetch
 * @property {(data: NetworkMonitoringNotificationTemplateRequest) => Promise<void>} onSubmitForm
 * @property {(template: NetworkMonitoringNotificationTemplate) => Promise<void>} onDelete
 */

/**
 * @typedef {Object} NotificationTemplateRefs
 * @property {React.RefObject} form
 */

/**
 * Custom hook for notification template management state and logic
 * @returns {{ state: NotificationTemplateState, handlers: NotificationTemplateHandlers, refs: NotificationTemplateRefs }}
 */
export function useNotificationTemplateState() {
  const formRef = useRef();
  const confirm = useConfirm();

  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('templateName');
  const [order, setOrder] = useState('asc');
  const loading = useBoolean(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const filteredTemplates = useMemo(
    () => filterAndSortTemplates(templates, search, orderBy, order),
    [templates, search, orderBy, order]
  );

  async function prefetch() {
    loading.onTrue();
    try {
      const data = await getNotificationTemplates();
      setTemplates(data);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function onAdd() {
    setSelectedTemplate(null);
    setShowForm(true);
  }

  function onEdit(template) {
    setSelectedTemplate(template);
    setShowForm(true);
  }

  function onClose() {
    setShowForm(false);
    setSelectedTemplate(null);
  }

  async function onSubmitForm(data) {
    loading.onTrue();
    try {
      if (selectedTemplate) {
        await updateNotificationTemplate(selectedTemplate._id, data);
      } else {
        await createNotificationTemplate(data);
      }
      await prefetch();
      toast.success('Berhasil disimpan');
      setShowForm(false);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function onDelete(template) {
    try {
      await confirm({
        title: 'Hapus Template',
        description: `Apakah anda yakin ingin menghapus template "${template.templateName}"?`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });

      await deleteNotificationTemplate(template._id);
      await prefetch();
      toast.success('Template berhasil dihapus');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  function sort(key) {
    if (key !== orderBy) {
      setOrderBy(key);
      setOrder('asc');
    } else {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }
  }

  useEffect(() => {
    prefetch();
  }, []);

  return {
    state: {
      templates,
      filteredTemplates,
      loading,
      search,
      orderBy,
      order,
      showForm,
      selectedTemplate,
    },
    handlers: {
      setSearch,
      sort,
      onAdd,
      onEdit,
      onClose,
      prefetch,
      onSubmitForm,
      onDelete,
    },
    refs: {
      form: formRef,
    },
  };
}
