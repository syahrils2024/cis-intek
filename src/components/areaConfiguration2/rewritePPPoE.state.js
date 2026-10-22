/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';

import { useTheme, useMediaQuery } from '@mui/material';

import { areaRepository } from 'src/repositories';

/**
 * @typedef {import('src/repositories/area').Area} Area
 */

export function useRewritePPPoEState() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const show = useBoolean(false);
  const rewriteSecret = useBoolean(false);
  const rewriteInterface = useBoolean(false);
  const isSubmited = useBoolean(false);
  const [logs, setLogs] = useState([]);

  /** @type {[Area, Function]} */
  const [area, setArea] = useState(null);

  const disabledSubmit = useMemo(() => {
    if (isSubmited.value) return true;
    return !rewriteSecret.value && !rewriteInterface.value;
  }, [rewriteSecret.value, rewriteInterface.value, isSubmited.value]);

  /**
   * @param {Area} a
   */
  function open(a) {
    reset();
    setArea(a);
    show.onTrue();
  }

  function reset() {
    isSubmited.onFalse();
    rewriteSecret.onFalse();
    rewriteInterface.onFalse();
    setLogs([]);
    setArea(null);
  }

  function close() {
    show.onFalse();
    reset();
  }

  async function submit() {
    isSubmited.onTrue();
    console.log('Submit called, isSubmited set to true');

    // Add initial log to show the process started
    setLogs(['Starting PPPoE rewrite process...']);

    toast.loading('Processing');
    try {
      const stream = await areaRepository.batchRewritePPPoEV2(area._id, {
        writeInterface: rewriteInterface.value,
        writeSecret: rewriteSecret.value,
      });

      const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream reading completed');
          setLogs((prev) => [...prev, 'Process completed.']);
          break;
        }
        console.log('Stream chunk received:', value);
        setLogs((prev) => [...prev, value]);
      }

      // console.log('Stream received:', stream);

      // stream?.on('data', (chunk) => {
      //   const chunkStr = chunk.toString();
      //   console.log('Stream data received:', chunkStr);
      //   setLogs((prev) => {
      //     const newLogs = [...prev, chunkStr];
      //     console.log('Setting logs:', newLogs);
      //     return newLogs;
      //   });
      // });

      // stream?.on('end', () => {
      //   console.log('Stream ended');
      //   setLogs((prev) => {
      //     const newLogs = [...prev, 'Process completed.'];
      //     console.log('Setting final logs:', newLogs);
      //     return newLogs;
      //   });
      // });

      // stream?.on('error', (error) => {
      //   console.error('Stream error:', error);
      //   setLogs((prev) => [...prev, `Error: ${error.message}`]);
      // });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) toast.error(error.message);
    } finally {
      toast.dismiss();
    }
  }

  return {
    state: {
      show,
      rewriteSecret,
      rewriteInterface,
      isSubmited,
      disabledSubmit,
      logs,
      mobile,
      area,
    },
    handlers: {
      open,
      submit,
      close,
    },
  };
}
