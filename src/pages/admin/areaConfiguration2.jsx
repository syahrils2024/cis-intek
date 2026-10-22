/**
 * @typedef {import('@/stores/areaConfiguration').AreaConfigurationStore} AreaConfigurationStore
 * @typedef {import('@/repositories/customer').Customer} Customer
 */
import { toast } from 'sonner';
import { download } from '@utils/download';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { connect, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useStatePersist } from 'use-state-persist';
import { usePrivilege } from '@auth/hooks/privileges';
import OdpGrid from '@components/areaConfiguration2/OdpGrid';
import OdpList from '@components/areaConfiguration2/odpList';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DeviceFormDialog2 from '@components/areaConfiguration2/DeviceFormDialog';
import { setPage, setCustomers, setTotalItems } from '@stores/areaConfiguration';
import CustomerFormDialog from '@components/areaConfiguration/customerFormDialog';
import AreaConfigurationSidePicker from '@components/areaConfiguration2/AreaPicker';
import AreaConfigurationFilterDialog from '@components/areaConfiguration2/areaConfigurationFilterDialog';

import Grid from '@mui/material/Unstable_Grid2';
import { TabList, TabPanel, TabContext, LoadingButton } from '@mui/lab';
import { Tab, useTheme, MenuItem, TextField, useMediaQuery, CircularProgress } from '@mui/material';

import 'src/extension/number';
import { setOdpStore } from 'src/stores/odpStore';
import { areaRepository } from 'src/repositories';
import { setTreeWidth, setOdpVariant } from 'src/stores/areaConfiguration';

import CustomerTab2 from 'src/components/areaConfiguration2/CustomerTab2';

/**
 *
 * @param {AreaConfigurationStore} props -- react props components with connect
 * @returns
 */
function AreaConfiguration({
  currentOdp,
  currentArea,
  page,
  totalItems,
  limit,
  treeWidth,
  find,
  odpVariant,
  odpOrder,
  odpOrderBy,
}) {
  const confirm = useConfirm();
  const theme = useTheme();
  const [showDialog, setShowDialog] = useState(false);
  const totalPage = Math.ceil(totalItems / limit);
  const dispatch = useDispatch();
  const [query, setQuery] = useSearchParams();
  const area = useRef();
  // const odp = useRef();
  const pageRef = useRef();
  const loading = useBoolean(false);
  const [currentPage, setCurrentPage] = useState(page);
  const [showFormCustomer, setShowFormCustomer] = useState(false);
  const odpVariants = ['list', 'grid'];
  const deviceFormDialogRef = useRef();
  const { isAdmin, isNoc } = usePrivilege();
  const loadingExport = useBoolean(false);

  /** @type {[Customer, void]} */
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const tabs = ['ODP', 'Pelanggan'];
  const tabsIcon = ['la:dot-circle', 'mdi:user-outline'];
  const [selectedTab, setSelectedTab] = useStatePersist(
    'areaConfiguration2.selectedTab',
    'Pelanggan'
  );

  /**
   * @param {Customer} item
   */
  const onEdit = (item) => {
    setSelectedCustomer(item);
    setShowFormCustomer(true);
  };

  const onCloseForm = (isPrefetch) => {
    setShowFormCustomer(false);
    setSelectedCustomer(null);
    if (isPrefetch) fetchCustomerData();
  };

  const fetchCustomerData = async () => {
    // console.log(find);

    if (!currentArea) {
      toast.warning('Mohon memilih area');
      return;
    }
    dispatch(setPage(0));
    loading.onTrue();
    if (!!currentOdp) {
      const snapshot = await areaRepository
        .getCustomerAreaWithODP(currentArea.id, currentOdp._id, {
          page,
          limit,
          status: 'active',
          find,
        })
        .catch((err) => {
          toast.error(err.message);
          return { customers: [], total: 0 };
        });
      dispatch(setTotalItems(snapshot.total));
      dispatch(setCustomers(snapshot.customers));
    } else if (!!currentArea) {
      const snapshot = await areaRepository
        .getCustomerArea(currentArea.id ?? currentArea._id, {
          page,
          limit,
          status: 'active',
          find,
        })
        .catch((err) => {
          toast.error(err.message);
          return { customers: [], total: 0 };
        });
      dispatch(setTotalItems(snapshot.total));
      dispatch(setCustomers(snapshot.customers));
    }
    loading.onFalse();
  };

  useEffect(() => {
    if (area.current) {
      area.current.value = currentArea?.title ?? '-';
    }
  }, [currentArea, currentOdp, page, limit, find]);

  useEffect(() => {
    const qTab = query.get('tab');
    if (qTab) {
      const isQTabValid = tabs.includes(qTab);
      if (isQTabValid) setSelectedTab(qTab);
    }
  });

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  async function exportOdp() {
    loadingExport.onTrue();
    try {
      if (!currentArea) throw new Error('area tidak valid');
      const blobData = await areaRepository.exportODP(currentArea?._id ?? currentArea?.id ?? '');
      const filename = `ODP-${currentArea.title}.xlsx`;
      download(blobData, filename);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingExport.onFalse();
    }
  }

  return (
    <>
      <PanelGroup direction="horizontal">
        {!isMobile && (
          <>
            <Panel
              minSize={20}
              maxSize={40}
              defaultSize={treeWidth}
              onResize={(size) => dispatch(setTreeWidth(size))}
            >
              <Grid xs={4} md={4}>
                <AreaConfigurationSidePicker />
              </Grid>
            </Panel>
            <PanelResizeHandle
              style={{
                marginRight: 5,
                marginLeft: 5,
                backgroundColor: 'rgb(224, 224, 224)',
                width: 0.5,
              }}
            />
          </>
        )}

        <Panel>
          <Grid container spacing={2}>
            <Grid xs={12} className="tw-w-full">
              <TabContext value={selectedTab}>
                <TabList onChange={(e, value) => setSelectedTab(value)} sx={{ paddingX: 0 }}>
                  {tabs.map((t, i) => (
                    <Tab label={t} icon={<Iconify icon={tabsIcon[i]} />} value={t} key={t} />
                  ))}
                </TabList>
                <TabPanel value="Pelanggan" sx={{ paddingX: 0 }}>
                  <CustomerTab2 />
                </TabPanel>
                <TabPanel value="ODP" sx={{ paddingX: 0 }}>
                  <div className="tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-justify-between tw-gap-3 tw-w-full">
                    {/* <Typography variant="h5">Konfigurasi Area</Typography> */}
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-gap-2 tw-pt-2 tw-w-full">
                      <TextField
                        select
                        value={odpVariant}
                        label="Display"
                        onChange={(e) => dispatch(setOdpVariant(e.target.value))}
                        size="small"
                        className="tw-w-full md:tw-w-32"
                      >
                        {odpVariants.map((v) => (
                          <MenuItem key={v} value={v}>
                            {v}
                          </MenuItem>
                        ))}
                      </TextField>
                      <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-gap-2 tw-w-full md:tw-w-auto">
                        <div className="md:tw-w-32 tw-w-full">
                          <TextField
                            fullWidth
                            label="Area"
                            inputRef={area}
                            size="small"
                            color="primary"
                            onClick={() => isMobile && setShowDialog(true)}
                            inputProps={{ readOnly: true }}
                            variant="filled"
                          />
                        </div>
                        <div className="md:tw-w-32 tw-w-full">
                          <TextField
                            fullWidth
                            label="Cari"
                            size="small"
                            color="primary"
                            onChange={(e) =>
                              dispatch(setOdpStore({ key: 'search', value: e.target.value }))
                            }
                          />
                        </div>
                        <div className="md:tw-w-32 tw-w-full">
                          <LoadingButton
                            size="small"
                            loading={loadingExport.value}
                            onClick={() => exportOdp()}
                            color="success"
                            variant="soft"
                            className="tw-gap-1"
                            fullWidth
                          >
                            <Iconify icon="mdi:file-excel" /> Export
                          </LoadingButton>
                        </div>
                        <div className="md:tw-w-32 tw-w-full">
                          <LoadingButton
                            size="small"
                            loading={loadingExport.value}
                            onClick={async () => {
                              await deviceFormDialogRef.current.open(
                                null,
                                currentArea._id ?? currentArea.id
                              );
                              fetchCustomerData();
                            }}
                            color="primary"
                            variant="contained"
                            className="tw-gap-1"
                            fullWidth
                          >
                            <Iconify icon="mdi:plus" /> Tambah
                          </LoadingButton>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tw-w-full tw-flex tw-flex-col tw-relative tw-gap-2 tw-h-min tw-mt-4">
                    {loading.value && (
                      <div className="tw-flex tw-bg-white/80 tw-absolute tw-items-center tw-justify-center tw-inset-0 tw-z-20">
                        <CircularProgress color="success" />
                      </div>
                    )}

                    {odpVariant === 'list' ? (
                      <OdpList readOnly={!isAdmin && !isNoc} />
                    ) : (
                      <OdpGrid readOnly={!isAdmin && !isNoc} />
                    )}
                  </div>
                </TabPanel>
              </TabContext>
            </Grid>
          </Grid>
        </Panel>
      </PanelGroup>
      <AreaConfigurationFilterDialog show={showDialog} onClose={() => setShowDialog(false)} />
      <CustomerFormDialog
        show={showFormCustomer}
        onClose={onCloseForm}
        selectedCustomer={selectedCustomer}
        statusMode="active"
      />
      <DeviceFormDialog2 ref={deviceFormDialogRef} />
    </>
  );
}

/**
 * @param {{areaConfigurationStore: AreaConfigurationStore}}
 */
const mapStateToProps = ({ areaConfigurationStore }) => {
  const {
    customers,
    currentOdp,
    currentArea,
    page,
    totalItems,
    limit,
    treeWidth,
    find,
    odpVariant,
  } = areaConfigurationStore;
  return {
    customers,
    currentOdp,
    currentArea,
    page,
    totalItems,
    limit,
    treeWidth,
    find,
    odpVariant,
  };
};

export default connect(mapStateToProps)(AreaConfiguration);
