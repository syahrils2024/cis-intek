/**
 * @typedef {import('@/stores/areaConfiguration').AreaConfigurationStore} AreaConfigurationStore
 * @typedef {import('@/repositories/customer').Customer} Customer
 */
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { areaRepository } from '@repositories';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { connect, useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { AreaConfigurationTable } from '@components/areaConfiguration/Table';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CustomerFormDialog from '@components/areaConfiguration/customerFormDialog';
import AreaConfigurationSidePicker from '@components/areaConfiguration/AreaPicker';
import AreaConfigurationFilterDialog from '@components/areaConfigurationFilterDialog';
import { AreaConfigurationMobileCard } from '@components/areaConfiguration/MobileCard';
import { setPage, setLimit, setCustomers, setTotalItems } from '@stores/areaConfiguration';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Button,
  useTheme,
  TextField,
  useMediaQuery,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import 'src/extension/number';
import { subscriptionRepository } from 'src/repositories';
import { setFind, setTreeWidth } from 'src/stores/areaConfiguration';
/**
 *
 * @param {AreaConfigurationStore} props -- react props components with connect
 * @returns
 */
function AreaConfiguration({
  customers,
  currentOdp,
  currentArea,
  page,
  totalItems,
  limit,
  treeWidth,
  find,
}) {
  const confirm = useConfirm();
  const theme = useTheme();
  const [showDialog, setShowDialog] = useState(false);
  const totalPage = Math.ceil(totalItems / limit);
  const dispatch = useDispatch();
  const area = useRef();
  const odp = useRef();
  const pageRef = useRef();
  const loading = useBoolean(false);
  const [currentPage, setCurrentPage] = useState(page);
  const [showFormCustomer, setShowFormCustomer] = useState(false);

  /** @type {[Customer, void]} */
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
    // console.log(find)

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
      // console.log({ snapshot });
      dispatch(setTotalItems(snapshot.total));
      dispatch(setCustomers(snapshot.customers));
    }
    loading.onFalse();
  };

  useEffect(() => {
    fetchCustomerData();
    area.current.value = currentArea?.title ?? '-';
    odp.current.value = currentOdp?.name ?? '-';
  }, [currentArea, currentOdp, page, limit, find]);

  /** @param {Customer} customer */
  const handlerRemove = async (customer) => {
    try {
      await confirm({
        title: 'Hapus Pelanggan',
        content: `apakah anda ingin menghapus ${customer.fullname}`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { variant: 'contained', color: 'error' },
        cancellationText: 'Batal',
        cancellationButtonProps: { variant: 'text', color: 'primary' },
      });

      await subscriptionRepository.turnOffCustomer(customer._id);
      await subscriptionRepository.isolateNetwork(customer._id);

      fetchCustomerData();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  /** @param {Customer} customer */
  const handlerEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowFormCustomer(true);
  };

  const handlerSetLimit = (e) => {
    dispatch(setLimit(e.target.value));
    dispatch(setPage(0));
  };

  const handlerSetPage = (e, newPage) => {
    dispatch(setPage(newPage));
    setCurrentPage(newPage);
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
          <Grid container spacing={2} className="tw-px-5">
            <Grid xs={12} className="tw-w-full">
              <div className="tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-justify-between tw-gap-3">
                {/* <Typography variant="h5">Konfigurasi Area</Typography> */}
                <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-gap-2 tw-pt-2">
                  <TextField
                    label="Area"
                    inputRef={area}
                    size="small"
                    color="primary"
                    onClick={() => isMobile && setShowDialog(true)}
                    inputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Perangkat"
                    inputRef={odp}
                    size="small"
                    color="primary"
                    onClick={() => isMobile && setShowDialog(true)}
                    inputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Cari"
                    size="small"
                    color="primary"
                    onChange={(e) => dispatch(setFind(e.target.value))}
                  />
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => setShowFormCustomer(true)}
                  >
                    <Icon icon="ic:baseline-add" /> Pelanggan
                  </Button>
                </div>
              </div>
              <div className="tw-w-full tw-flex tw-flex-col tw-relative tw-gap-2 tw-h-min tw-mt-4">
                {loading.value && (
                  <div className="tw-flex tw-bg-white/80 tw-absolute tw-items-center tw-justify-center tw-inset-0 tw-z-20">
                    <CircularProgress color="success" />
                  </div>
                )}
                {isMobile ? (
                  customers.map((customer, i) => (
                    <AreaConfigurationMobileCard
                      key={i}
                      customer={customer}
                      onEdit={() => handlerEdit(customer)}
                      onRemove={() => handlerRemove(customer)}
                    />
                  ))
                ) : (
                  <AreaConfigurationTable
                    customers={customers}
                    onEdit={handlerEdit}
                    onRemove={handlerRemove}
                  />
                )}
              </div>
              <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full">
                <TablePagination
                  component="div"
                  count={totalItems}
                  page={currentPage}
                  onPageChange={handlerSetPage}
                  rowsPerPage={limit}
                  onRowsPerPageChange={handlerSetLimit}
                />
                {/* <Select defaultValue={limit} value={limit} onChange={handlerSetLimit} size="small">
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
            <Pagination
              ref={pageRef}
              count={totalPage}
              size="small"
              onChange={(e, value) => dispatch(setPage(value - 1))}
            /> */}
              </div>
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
    </>
  );
}

/**
 * @param {{areaConfigurationStore: AreaConfigurationStore}}
 */
const mapStateToProps = ({ areaConfigurationStore }) => {
  const { customers, currentOdp, currentArea, page, totalItems, limit, treeWidth, find } =
    areaConfigurationStore;
  return { customers, currentOdp, currentArea, page, totalItems, limit, treeWidth, find };
};

export default connect(mapStateToProps)(AreaConfiguration);
