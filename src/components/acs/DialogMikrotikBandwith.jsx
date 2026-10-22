import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useDebounce } from 'use-debounce';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { ChartTraffic } from '@components/customerEngineer/ChartTraffic';

import { useTheme, useMediaQuery } from '@mui/material';

import { useMikrotikStore } from 'src/stores/mikrotikStatus';

/**
 * @typedef {import("src/stores/mikrotikStatus").MikrotikStore} MikrotikStore
 * @typedef {import('src/repositories/mikrotik').TrafficStats} TrafficStats
 */

const AcsDialogMikrotikBandwith = forwardRef(({ customer }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  /**
   * @type {MikrotikStore}
   */
  const { rxBits, txBits, trafficTime, addRxBits, addTxBits, addTrafficTime } = useMikrotikStore();
  const [txBitsDebounce] = useDebounce(txBits, 500);
  const [rxBitsDebounce] = useDebounce(rxBits, 500);
  const [trafficTimeDebounce] = useDebounce(trafficTime, 500);
  const socketRef = useRef(null);

  const connect = ({ customer_id }) => {
    const eventName = 'mikrotik-traffic';
    const eventNameReceiver = 'mikrotik-traffic-receiver';

    if (!socketRef.current) {
      const domain = import.meta.env.VITE_SOCKET_DOMAIN || 'https://ws.cis-intek.id';
      // const domain = 'http://localhost:4000';
      socketRef.current = io(domain, {
        autoConnect: false,
      });
    }

    const socketClient = socketRef.current;

    socketClient.on('connect', (socket) => {
      socketClient.emit(eventName, {
        customerId: customer_id ?? customer._id,
      });

      socketClient.on(eventNameReceiver, (socketData) => {
        if (socketData.success) {
          const now = new Date();
          /** @type {TrafficStats} */
          const stats = socketData.data;
          if (!stats.unit) return;
          addRxBits(stats.rxBitsPerSecond ?? 0);
          addTxBits(stats.txBitsPerSecond ?? 0);

          // if (typeof stats.rxBitsPerSecond !== 'undefined') {
          //   // const copyRxBits = [...rxBits, stats.rxBitsPerSecond];
          //   addRxBits(stats.rxBitsPerSecond);
          //   // setRxBits((state) => [...state, stats.rxBitsPerSecond]);
          // }

          // if (typeof stats.txBitsPerSecond !== 'undefined') {
          //   const copyTxBits = [...txBits, stats.txBitsPerSecond];
          //   addTxBits(stats.txBitsPerSecond);
          //   // setTxBits((state) => [...state, stats.txBitsPerSecond]);
          // }

          if (typeof stats.time !== 'undefined') {
            // const copyTime = [...trafficTime, stats.time];
            addTrafficTime(stats.time);
            // setTrafficTime((state) => [...state, stats.time]);
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

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null; // Reset reference after disconnection
    }
  };

  useImperativeHandle(ref, () => ({ connect, disconnect }));

  return (
    <div className="tw-flex tw-flex-col">
      <div className="tw-flex tw-flex-row">
        <span className="tw-text-xs">
          Paket:{' '}
          <span className="tw-text-xs tw-font-semibold">{customer?.packageData?.title ?? '-'}</span>{' '}
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
  );
});

export default AcsDialogMikrotikBandwith;
