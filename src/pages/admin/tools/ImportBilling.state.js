import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { download } from '@utils/download';
import { useBoolean } from '@hooks/use-boolean';

import { xlsxRepository } from 'src/repositories';
import { importBilling } from 'src/repositories/xlsx';

/**
 * @typedef {import('src/repositories/xlsx').DownloadCustomerTemplateParam} DownloadCustomerTemplateParam
 * @typedef {import('src/repositories/xlsx').CustomerTemplateValidation} CustomerTemplateValidation
 * @typedef {import('src/repositories/xlsx').BillingTemplateValidationV2} BillingTemplateValidationV2
 */

export function useToolsImportBillingState() {
  const loadingDownloadTemplate = useBoolean(false);
  const loadingValidate = useBoolean(false);
  const disableSubmit = useBoolean(false);
  const loadingSubmit = useBoolean(false);

  /** @type {[CustomerTemplateValidation[], void]} */
  const [validatedData, setValidatedData] = useState([]);

  /** @type {[BillingTemplateValidationV2[], void]} */
  const [validatedDataV2, setValidatedDataV2] = useState([]);

  const validatedDataV2Filter = useMemo(() => {
    const errorData = validatedDataV2.filter((d) => !!d.error);
    const validData = validatedDataV2.filter((d) => !d.error);
    const hasExport = validData.filter((d) => d.hasExported);
    const hasNotExport = validData.filter((d) => !d.hasExported);
    return {
      error: errorData,
      valid: validData,
      hasExport,
      hasNotExport,
    };
  }, [validatedDataV2]);

  const [tab, setTab] = useState('billing_entry');
  const tabs = useMemo(() => {
    const t = {
      billing_entry: 'Data',
      billing_entry_error: 'Error',
      billing_entry_has_exported: 'Sudah Pernah Di-Export',
    };

    const validatedDataHaveError = validatedDataV2.some((d) => d.error);
    const validatedDataHaveHasExported = validatedDataV2.some((d) => d.hasExported);

    if (!validatedDataHaveHasExported) {
      delete t.billing_entry_has_exported;
    }
    if (!validatedDataHaveError) {
      delete t.billing_entry_error;
    }

    return Object.entries(t).map(([value, title]) => ({ value, title }));
  }, [validatedDataV2]);

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const paginateData = useMemo(() => {
    const start = page * limit;
    const end = start + limit;
    return validatedData.slice(start, end);
  });

  /**
   * @param {DownloadCustomerTemplateParam[]} templates
   */
  async function downloadTemplate() {
    loadingDownloadTemplate.onTrue();
    try {
      const blob = await xlsxRepository.downloadBillingTemplateV2();
      download(blob, 'import_billing.xlsx');
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
      const result = await xlsxRepository.validateBillingTemplateV2(file);
      setValidatedDataV2(result);
      disableSubmit.onFalse();
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingValidate.onFalse();
    }
  }

  async function validateXlsxV2(file) {
    loadingValidate.onTrue();
    setPage(0);
    try {
      const result = await xlsxRepository.validateBillingTemplateV2(file);
      setValidatedDataV2(result);
      disableSubmit.onFalse();
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingValidate.onFalse();
    }
  }

  async function submit() {
    loadingSubmit.onTrue();
    try {
      const data = validatedDataV2Filter.hasNotExport;
      if (data.length <= 0) throw new Error('Import data dulu');
      await xlsxRepository.importBillingV2(data);
      disableSubmit.onTrue();
      toast.success('Berhasil melakukan upload billing');
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
    importBilling,
    page,
    limit,
    disableSubmit,
    loadingSubmit,
    setPage,
    setLimit,
    paginateData,
    downloadTemplate,
    validateXlsx,
    submit,
    validatedDataV2,
    tab,
    tabs,
    setTab,
    validatedDataV2Filter,
    validateXlsxV2,
  };
}
