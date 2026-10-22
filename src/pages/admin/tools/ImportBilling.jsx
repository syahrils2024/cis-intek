import { useRef } from 'react';

import { Tab, Stack, useTheme, useMediaQuery } from '@mui/material';
import { TabList, TabPanel, TabContext, LoadingButton } from '@mui/lab';

import { BillingEntryTab } from './components/BillingEntry';
import { useToolsImportBillingState } from './ImportBilling.state';

export default function ToolsImportBilling() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    downloadTemplate,
    loadingDownloadTemplate,
    loadingValidate,
    validateXlsx,
    validatedData,
    limit,
    page,
    paginateData,
    importBilling,
    loadingSubmit,
    disableSubmit,
    setLimit,
    setPage,
    submit,
    validatedDataV2,
    tab,
    tabs,
    setTab,
    validatedDataV2Filter,
    validateXlsxV2,
  } = useToolsImportBillingState();

  const templatePickerRef = useRef();

  async function getTemplate() {
    // const result = await templatePickerRef.current.open();
    // if (!result) return;
    await downloadTemplate();
  }

  async function uploadTemplate() {
    const uploader = document.createElement('input');
    uploader.setAttribute('type', 'file');
    uploader.setAttribute(
      'accept',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    uploader.addEventListener('change', (e) => {
      const { files } = e.target;
      if (files.length <= 0) return;
      validateXlsxV2(files[0]);
    });
    uploader.click();
    uploader.remove();
  }

  return (
    <div className="tw-flex tw-flex-col tw-p-5 tw-relative tw-gap-4">
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-w-full tw-items-center tw-justify-between">
        <h1 className="md:tw-text-lg tw-text-base tw-font-semibold">&nbsp;</h1>
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-4 tw-w-full md:tw-w-auto">
          <LoadingButton
            loading={loadingDownloadTemplate.value}
            variant="soft"
            color="primary"
            onClick={() => getTemplate()}
          >
            Download Template
          </LoadingButton>
          <LoadingButton
            variant="contained"
            color="primary"
            loading={loadingValidate.value}
            onClick={() => uploadTemplate()}
          >
            Import
          </LoadingButton>
          {validatedDataV2Filter.hasNotExport.length >= 1 ? (
            <LoadingButton
              variant="contained"
              color="success"
              disabled={disableSubmit.value || validatedDataV2Filter.hasNotExport.length <= 0}
              loading={loadingSubmit.value}
              onClick={() => submit()}
            >
              Upload
            </LoadingButton>
          ) : null}
        </div>
      </div>
      <Stack>
        <TabContext value={tab}>
          <TabList onChange={(e, value) => setTab(value)}>
            {tabs.map((t, i) => (
              <Tab label={t.title} value={t.value} key={i} />
            ))}
          </TabList>
          <TabPanel value="billing_entry" sx={{ px: 0 }}>
            <BillingEntryTab items={validatedDataV2Filter.hasNotExport} />
          </TabPanel>
          <TabPanel value="billing_entry_error" sx={{ px: 0 }}>
            <BillingEntryTab items={validatedDataV2Filter.error} error />
          </TabPanel>
          <TabPanel value="billing_entry_has_exported" sx={{ px: 0 }}>
            <BillingEntryTab items={validatedDataV2Filter.hasExport} />
          </TabPanel>
        </TabContext>
      </Stack>

      {/* <div className="tw-flex tw-flex-col tw-mt-4">
        <ToolsImportBillingTemplatePicker ref={templatePickerRef} />
      </div> */}
    </div>
  );
}
