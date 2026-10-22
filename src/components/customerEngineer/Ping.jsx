import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';

export const MikrotikPing = forwardRef((props, ref) => {
  const socketRef = useRef();
  const [pingHistory, setPingHistory] = useState([]);

  function connect(customer) {
    const eventName = 'mikrotik-ping';
    const eventNameReceiver = 'mikrotik-ping-receiver';

    // setPingHistory([]);
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
          const pingResult = socketData.data;
          setPingHistory((prev) => [...prev, pingResult]);
        } else {
          toast.error(socketData.error);
        }
      });
    });

    socketClient.on('disconnect', () => {
      console.log('Disconnected ping');
    });

    socketClient.connect();
  }

  function disconnect() {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null; // Reset reference after disconnection
    }
  }

  useImperativeHandle(ref, () => ({ connect, disconnect }));

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-relative tw-text-xs">
      <ol className="tw-gap-2 tw-list-disc tw-px-5">
        {pingHistory.map((ping, i) => (
          <li key={i}>{ping}</li>
        ))}
      </ol>
    </div>
  );
});

export default MikrotikPing;
