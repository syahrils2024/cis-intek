import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { download } from '@utils/download';
import { useBoolean } from '@hooks/use-boolean';

import { xlsxRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/xlsx').ODPTemplateValidation} ODPTemplateValidation
 */

export function useToolsImportODPState() {
  const loadingDownloadTemplate = useBoolean(false);
  const loadingValidate = useBoolean(false);
  const disableSubmit = useBoolean(false);
  const loadingSubmit = useBoolean(false);

  /** @type {[ODPTemplateValidation[], void]} */
  const [validatedData, setValidatedData] = useState([]);

  const validatedDataFilter = useMemo(() => {
    const errorData = validatedData.filter((d) => !!d.error);
    const validData = validatedData.filter((d) => !d.error);
    const hasExport = validData.filter((d) => d.exists);
    const hasNotExport = validData.filter((d) => !d.exists);
    return {
      error: errorData,
      valid: validData,
      hasExport,
      hasNotExport,
    };
  }, [validatedData]);

  const [tab, setTab] = useState('odp_data');
  const tabs = useMemo(() => {
    const t = {
      odp_data: 'Data',
      odp_error: 'Error',
      odp_has_exported: 'Sudah Di-Export',
    };

    const validatedDataHaveError = validatedData.some((d) => d.error);
    const validatedDataHaveHasExported = validatedData.some((d) => d.exists);

    if (!validatedDataHaveHasExported) {
      delete t.odp_has_exported;
    }
    if (!validatedDataHaveError) {
      delete t.odp_error;
    }

    return Object.entries(t).map(([value, title]) => ({ value, title }));
  }, [validatedData]);

  async function downloadTemplate() {
    loadingDownloadTemplate.onTrue();
    try {
      const blob = await xlsxRepository.downloadOdpTemplate();
      download(blob, 'import_odp.xlsx');
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingDownloadTemplate.onFalse();
    }
  }

  async function validateXlsx(file) {
    loadingValidate.onTrue();
    try {
      const result = await xlsxRepository.validateOdpTemplate(file);
      setValidatedData(result);
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
      const data = validatedDataFilter.hasNotExport;
      if (data.length <= 0) throw new Error('Import data dulu');
      await xlsxRepository.importOdp(data);
      disableSubmit.onTrue();
      toast.success('Berhasil melakukan upload ODP');
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
    disableSubmit,
    loadingSubmit,
    downloadTemplate,
    validateXlsx,
    submit,
    tab,
    tabs,
    setTab,
    validatedDataFilter,
  };
}
