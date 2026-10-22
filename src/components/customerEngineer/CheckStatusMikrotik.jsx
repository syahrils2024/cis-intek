/**
 * @typedef {import("src/repositories/customer").Customer} Customer
 * @typedef {import('src/repositories/mikrotik').ResultCheckConnectionDetail} ResultCheckConnectionDetail
 * @typedef {import('src/repositories/mikrotik').TrafficStats} TrafficStats
 * @typedef {import('src/repositories/area').TopologyCustomer} TopologyCustomer
 * @typedef {import('src/repositories/mikrotik').ResultCheckConnectionStatus} ResultCheckConnectionStatus
 */

import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useDebounce } from 'use-debounce';
import { useBoolean } from '@hooks/use-boolean';
import Overloading from '@components/overloading';
import { useRef, useState, useEffect } from 'react';

import { TabList, TabPanel, TabContext } from '@mui/lab';
import {
  Tab,
  Button,
  Dialog,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';
import { mikrotikRepository } from 'src/repositories';

import Ping from './Ping';
import CheckLog from './CheckLog';
import { ChartTraffic } from './ChartTraffic';

/**
 * @param {{customer: Customer; onClose: () => void; show: boolean}} props
 */
export default function CheckStatusMikrotik({ show, onClose, customer }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const socketRef = useRef(null);
  const pingComponentRef = useRef();
  const isPing = useBoolean(false);

  /** @type {[ResultCheckConnectionStatus, void]} */
  const [data, setData] = useState(null);

  // const [flags, setFlags] = useState([]);
  const isTrafficRunning = useBoolean(false);
  const [selectedTab, setSelectedTab] = useState('status');
  const [rxBits, setRxBits] = useState([]);
  const [txBits, setTxBits] = useState([]);
  const [trafficTime, setTrafficTime] = useState([]);

  const [txBitsDebounce] = useDebounce(txBits, 500);
  const [rxBitsDebounce] = useDebounce(rxBits, 500);
  const [trafficTimeDebounce] = useDebounce(trafficTime, 500);

  const tabs = [
    { label: 'Status', value: 'status' },
    {
      label: 'Traffic',
      value: 'traffic',
    },
    {
      label: 'Log',
      value: 'log',
    },
    {
      label: 'Ping',
      value: 'ping',
    },
  ];

  const flagStatus = {
    D: 'dynamic',
    R: 'running',
    X: 'disabled',
  };

  const loading = useBoolean(false);

  const handlerCheck = async () => {
    loading.onTrue();
    try {
      if (!customer) throw new Error('Mohon memuat ulang data');
      const snapshot = await mikrotikRepository.checkConnection(customer._id);

      setData(snapshot);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  const connectToWebSocket = () => {
    isTrafficRunning.onTrue();
    const eventName = 'mikrotik-traffic';
    const eventNameReceiver = 'mikrotik-traffic-receiver';

    if (!socketRef.current) {
      const domain = import.meta.env.VITE_SOCKET_DOMAIN || 'https://ws.cis-intek.id';
      socketRef.current = io(domain, {
        autoConnect: false,
      });
    }

    const socketClient = socketRef.current;

    socketClient.on('connect', (socket) => {
      socketClient.emit(eventName, {
        customerId: customer._id,
      });

      socketClient.on(eventNameReceiver, (socketData) => {
        if (socketData.success) {
          /** @type {TrafficStats} */
          const stats = socketData.data;
          if (typeof stats.rxBitsPerSecond !== 'undefined') {
            setRxBits((state) => [...state, stats.rxBitsPerSecond]);
          }

          if (typeof stats.txBitsPerSecond !== 'undefined') {
            setTxBits((state) => [...state, stats.txBitsPerSecond]);
          }

          if (typeof stats.time !== 'undefined') {
            setTrafficTime((state) => [...state, stats.time]);
          }
        } else {
          toast.error(socketData.error);
        }
      });
    });

    socketClient.on('disconnect', () => {
      console.log('Disconnected');
    });

    socketClient.connect();
  };

  const disconnectWebsocket = () => {
    isTrafficRunning.onFalse();
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null; // Reset reference after disconnection
    }
  };

  const onBeforeClose = () => {
    disconnectWebsocket();
    onClose();
  };

  useEffect(() => {
    if (!show) {
      setData(null);
      // setFlags([]);
      setRxBits([]);
      setTxBits([]);
      setTrafficTime([]);
      return;
    }

    handlerCheck();
    connectToWebSocket();
  }, [show]);

  function connectPing() {
    isPing.onTrue();
    pingComponentRef.current.connect(customer);
  }

  function disconnectPing() {
    isPing.onFalse();
    pingComponentRef.current.disconnect();
  }

  return (
    <Dialog open={show} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle>
        <div className="tw-flex tw-flex-row tw-items-start tw-justify-between">
          <span>Realtime Traffic</span>
          <div className="tw-flex tw-flex-col tw-text-right">
            <span className="tw-text-xs tw-font-medium">{customer?.fullname}</span>
            <span className="tw-text-xs tw-text-gray-500">{customer?.customerId ?? '-'}</span>
            <span className="tw-text-xs tw-text-gray-500">{customer?.odpName}</span>
            <span className="tw-text-xs tw-text-gray-500">{customer?.phone}</span>
            <span className="tw-text-xs tw-text-gray-500">{customer?.address}</span>
          </div>
        </div>
      </DialogTitle>
      <DialogContent>
        <TabContext value={selectedTab}>
          <TabList onChange={(e, value) => setSelectedTab(value)}>
            {tabs.map((t, i) => (
              <Tab key={i} label={t.label} value={t.value} />
            ))}
          </TabList>
          <TabPanel value="status" sx={{ paddingX: 0 }}>
            <div className="tw-flex tw-flex-col tw-gap-2 tw-relative">
              <Overloading loading={loading.value} />

              {/* <div className="tw-flex tw-flex-col">
                <span className="tw-text-gray-400 tw-text-xs">Pelanggan</span>
                <span className="tw-text-xs tw-font-medium">{customer?.fullname}</span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-gray-400 tw-text-xs">ID</span>
                <span className="tw-text-xs tw-font-medium">{customer?.customerId ?? '-'}</span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-gray-400 tw-text-xs">Nomor Telepon</span>
                <span className="tw-text-xs tw-font-medium">{customer?.phone}</span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-gray-400 tw-text-xs">Alamat</span>
                <span className="tw-text-xs tw-font-medium">{customer?.address}</span>
              </div> */}
              {/* <Divider /> */}
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-gray-400 tw-text-xs">Uptime</span>
                <span className="tw-text-xs tw-font-medium">{data?.uptime}</span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-gray-400 tw-text-xs">Status Perangkat</span>
                <span
                  className={`tw-text-xs tw-font-medium ${
                    data?.flags.includes('R') ? 'tw-text-green-600' : 'tw-text-red-600'
                  }`}
                >
                  {data?.flags.includes('R')
                    ? 'Running / Connected'
                    : 'Tidak Running / Disconnected'}
                </span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-gray-400 tw-text-xs">User</span>
                <span className="tw-text-xs tw-font-medium">{data?.user}</span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-gray-400 tw-text-xs">Interface</span>
                <span className="tw-text-xs tw-font-medium">{data?.name}</span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-gray-400 tw-text-xs">Service</span>
                <span className="tw-text-xs tw-font-medium">{data?.service}</span>
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-gray-400 tw-text-xs">Mac Address</span>
                <span className="tw-text-xs tw-font-medium">{data?.remoteAddress}</span>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="traffic" sx={{ paddingX: 0 }}>
            <div className="tw-w-full tw-h-full tw-flex tw-flex-col">
              <div className="tw-flex tw-flex-row">
                <span className="tw-text-xs">
                  Paket:{' '}
                  <span className="tw-text-xs tw-font-semibold">
                    {customer?.packageData?.title ?? '-'}
                  </span>{' '}
                  (Rp. {customer?.activePackage?.price.formatCurrency()})
                </span>
              </div>
              <ChartTraffic
                positionLabel={isMobile ? 'bottom' : 'top'}
                chart={{
                  series: [
                    {
                      name: `${isMobile ? 'Out' : 'Upload'} (${rxBitsDebounce.length <= 0 ? 0 : rxBitsDebounce.at(-1).toFixed(2)} Mbps)`,
                      data: rxBitsDebounce,
                    },
                    {
                      name: `${isMobile ? 'In' : 'Download'} (${txBitsDebounce.length <= 0 ? 0 : txBitsDebounce.at(-1).toFixed(2)} Mbps)`,
                      data: txBitsDebounce,
                    },
                  ],
                  categories: trafficTimeDebounce,
                }}
              />
            </div>
          </TabPanel>
          <TabPanel value="log" sx={{ paddingX: 0 }}>
            <CheckLog customer={customer} />
          </TabPanel>
          <TabPanel value="ping" sx={{ paddingX: 0 }}>
            <Ping ref={pingComponentRef} />
          </TabPanel>
        </TabContext>
      </DialogContent>
      <DialogActions>
        <div className="tw-flex tw-flex-row tw-items-center tw-gap-2 tw-justify-between tw-w-full">
          <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
            {selectedTab === 'ping' && (
              <>
                {isPing.value ? (
                  <Button color="error" onClick={() => disconnectPing()} variant="outlined">
                    Stop Ping
                  </Button>
                ) : (
                  <Button color="primary" onClick={() => connectPing()} variant="outlined">
                    Ping
                  </Button>
                )}
              </>
            )}
            {selectedTab === 'traffic' && (
              <>
                {isTrafficRunning.value ? (
                  <Button color="error" onClick={() => disconnectWebsocket()} variant="outlined">
                    Stop Traffic
                  </Button>
                ) : (
                  <Button color="primary" onClick={() => connectToWebSocket()} variant="outlined">
                    Start Traffic
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
            <Button color="error" onClick={onBeforeClose}>
              Tutup
            </Button>
            <Button variant="contained" color="success" onClick={() => handlerCheck()}>
              Refresh
            </Button>
          </div>
        </div>
      </DialogActions>
    </Dialog>
  );
}
