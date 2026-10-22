import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { download } from '@utils/download';
import { useBoolean } from '@hooks/use-boolean';

import { xlsxRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/xlsx').DownloadCustomerTemplateParam} DownloadCustomerTemplateParam
 * @typedef {import('src/repositories/xlsx').CustomerTemplateValidation} CustomerTemplateValidation
 * @typedef {import('src/repositories/xlsx').CustomerTemplateValidationV2} CustomerTemplateValidationV2
 */

export function useToolsImportCustomerState() {
  const loadingDownloadTemplate = useBoolean(false);
  const loadingValidate = useBoolean(false);
  const disableSubmit = useBoolean(false);
  const loadingSubmit = useBoolean(false);

  /** @type {[CustomerTemplateValidation[], void]} */
  const [validatedData, setValidatedData] = useState([]);

  const [validatedDataV2, setValidatedDataV2] = useState(
    /** @type {CustomerTemplateValidationV2} */ (null)
  );

  const availableUpload = useMemo(() => validatedDataV2 !== null, [validatedDataV2]);

  const [tab, setTab] = useState('customer');
  const tabs = useMemo(() => {
    const t = {
      customer: 'Pelanggan',
      customerImported: 'Pelanggan Terdaftar',
      newOdp: 'ODP Baru',
      newAddon: 'Addon Baru',
    };

    if (!validatedDataV2) return [];

    const newAddonsLength = Object.keys(validatedDataV2?.newAddons ?? {}).length;
    const newOdpLength = Object.keys(validatedDataV2?.newOdp ?? {}).length;
    const hasRegisterDataLength = validatedDataV2?.hasRegisterData?.length ?? 0;

    if (newOdpLength <= 0) delete t.newOdp;
    if (newAddonsLength <= 0) delete t.newAddon;
    if (hasRegisterDataLength <= 0) delete t.customerImported;

    const tabsData = Object.entries(t).map(([value, title]) => ({ value, title }));

    return tabsData;
  }, [validatedDataV2]);

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const paginateData = useMemo(() => {
    const start = page * limit;
    const end = start + limit;
    return validatedData.slice(start, end);
  });

  const warningColor = 'tw-text-red-500';
  const coloringValidatedData = useMemo(() => {
    /** @type {CustomerTemplateValidation[]} */
    const v = validatedData.map((d) => ({
      areaTitle: d.areaId === '???' ? warningColor : '',
      customerId: d.customerId.trim() === '' ? warningColor : '',
      odpTitle: d.odpId === '???' ? warningColor : '',
      vlan: d.vlan === '' ? warningColor : '',
      pppoeName: d.pppoeName === '' ? warningColor : '',
      pppoePassword: d.pppoePassword.trim() === '' ? warningColor : '',
    }));

    return v;
  });

  /**
   * [DEPRECATED] Download Template Import For Import Customer
   * Download Template Import For Import Customer [DEPRECATED] --- IGNORE ---
   * @param {DownloadCustomerTemplateParam[]} templates
   */
  async function downloadTemplate(templates) {
    loadingDownloadTemplate.onTrue();
    try {
      const blob = await xlsxRepository.downloadCustomerTemplate(templates);
      download(blob, 'import_customer.xlsx');
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingDownloadTemplate.onFalse();
    }
  }

  async function downloadTemplateV2() {
    loadingDownloadTemplate.onTrue();
    try {
      const blob = await xlsxRepository.downloadCustomerTemplateV2();
      download(blob, 'import_customer.xlsx');
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingDownloadTemplate.onFalse();
    }
  }

  async function validateXlsx(file) {
    loadingValidate.onTrue();
    setPage(0);
    try {
      const result = await xlsxRepository.validateCustomerTemplateV2(file);
      setValidatedDataV2(result);
      disableSubmit.onFalse();
      setTab('customer');
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingValidate.onFalse();
    }
  }

  async function submit() {
    loadingSubmit.onTrue();
    try {
      if (validatedDataV2 === null) throw new Error('Import data dulu');
      await xlsxRepository.importCustomerV2(validatedDataV2);
      disableSubmit.onTrue();
      toast.success('Berhasil melakukan upload pelanggan');
      setValidatedDataV2(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingSubmit.onFalse();
    }
  }

  return {
    loadingDownloadTemplate,
    validatedData,
    loadingValidate,
    coloringValidatedData,
    page,
    limit,
    disableSubmit,
    loadingSubmit,
    tab,
    setTab,
    tabs,
    setPage,
    setLimit,
    paginateData,
    downloadTemplate,
    downloadTemplateV2,
    validateXlsx,
    submit,
    validatedDataV2,
    availableUpload,
  };
}
