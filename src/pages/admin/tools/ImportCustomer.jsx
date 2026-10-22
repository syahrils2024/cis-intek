import { useRef } from 'react';

import { Tab, Stack, useTheme, useMediaQuery } from '@mui/material';
import { TabList, TabPanel, TabContext, LoadingButton } from '@mui/lab';

import { OdpEntryData } from './components/OdpEntryTab';
import { AddonEntryData } from './components/AddonEntryTab';
import { CustomerImportData } from './components/CustomerImportTab';
import { useToolsImportCustomerState } from './ImportCustomer.state';

export default function ToolsImportCustomer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    downloadTemplate,
    loadingDownloadTemplate,
    loadingValidate,
    validateXlsx,
    validatedData,
    coloringValidatedData,
    limit,
    page,
    paginateData,
    loadingSubmit,
    disableSubmit,
    setLimit,
    setPage,
    submit,
    tab,
    setTab,
    tabs,
    downloadTemplateV2,
    validatedDataV2,
    availableUpload,
  } = useToolsImportCustomerState();

  const templatePickerRef = useRef();

  async function getTemplate() {
    await downloadTemplateV2();
    // const result = await templatePickerRef.current.open();
    // if (!result) return;
    // await downloadTemplate(result);
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
      validateXlsx(files[0]);
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
          {availableUpload ? (
            <LoadingButton
              variant="contained"
              color="success"
              disabled={disableSubmit.value}
              loading={loadingSubmit.value}
              onClick={() => submit()}
            >
              Upload
            </LoadingButton>
          ) : null}
        </div>
      </div>
      <Stack>
        {validatedDataV2 != null ? (
          <TabContext value={tab} sx={{ px: 0 }}>
            <TabList onChange={(e, newValue) => setTab(newValue)} sx={{ px: 0 }}>
              {tabs.map((t, i) => (
                <Tab label={t.title} value={t.value} key={i} />
              ))}
            </TabList>
            <TabPanel value="customer" sx={{ px: 0 }}>
              <CustomerImportData items={validatedDataV2?.data ?? []} />
            </TabPanel>
            <TabPanel value="newOdp" sx={{ px: 0 }}>
              <OdpEntryData items={Object.values(validatedDataV2?.newOdp ?? {})} />
            </TabPanel>
            <TabPanel value="newAddon" sx={{ px: 0 }}>
              <AddonEntryData items={Object.values(validatedDataV2?.newAddons ?? {})} />
            </TabPanel>
            <TabPanel value="customerImported" sx={{ px: 0 }}>
              <CustomerImportData items={validatedDataV2?.hasRegisterData ?? []} />
            </TabPanel>
          </TabContext>
        ) : null}
      </Stack>
    </div>
  );
}
