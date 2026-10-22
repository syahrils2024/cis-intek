import { Tab, Stack, useTheme, useMediaQuery } from '@mui/material';
import { TabList, TabPanel, TabContext, LoadingButton } from '@mui/lab';

import { useToolsImportODPState } from './ImportODP.state';
import { ImportODPEntryTab } from './components/ImportODPEntry';

export default function ToolsImportODP() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    downloadTemplate,
    loadingDownloadTemplate,
    loadingValidate,
    validateXlsx,
    validatedData,
    loadingSubmit,
    disableSubmit,
    submit,
    tab,
    tabs,
    setTab,
    validatedDataFilter,
  } = useToolsImportODPState();

  async function getTemplate() {
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
          {validatedDataFilter.hasNotExport.length >= 1 ? (
            <LoadingButton
              variant="contained"
              color="success"
              disabled={disableSubmit.value || validatedDataFilter.hasNotExport.length <= 0}
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
          <TabPanel value="odp_data" sx={{ px: 0 }}>
            <ImportODPEntryTab items={validatedDataFilter.hasNotExport} />
          </TabPanel>
          <TabPanel value="odp_error" sx={{ px: 0 }}>
            <ImportODPEntryTab items={validatedDataFilter.error} error />
          </TabPanel>
          <TabPanel value="odp_has_exported" sx={{ px: 0 }}>
            <ImportODPEntryTab items={validatedDataFilter.hasExport} />
          </TabPanel>
        </TabContext>
      </Stack>
    </div>
  );
}
