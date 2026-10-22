import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useRef, useEffect } from 'react';
import Overloading from '@components/overloading';
import { useDebouncedCallback } from 'use-debounce';
import AreaPickerFilter from '@components/billing/areaPickerFilter';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Grid,
  Chip,
  Table,
  Stack,
  TableRow,
  useTheme,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  Accordion,
  TextField,
  useMediaQuery,
  TablePagination,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import 'src/extension/string';
import 'src/extension/date';
import { whatsappLogRepository } from 'src/repositories';

import useWhatsappSettingStore from '../whatsappSetting.store';
import { useWhatsappLogAreaStore } from '../whatsappLogArea.store';

/**
 * @typedef {import('../whatsappLogArea.store').WhatsappLogAreaStore} WhatsappLogAreaStore
 * @typedef {import('../whatsappSetting.state').WhatsappSettingState} WhatsappSettingState
 */

const WhatsappLogAreaPanel = () => {
  /** @type {WhatsappLogAreaStore} */
  const {
    currentPage,
    isLoading,
    limit,
    log,
    fromWhatsappNode,
    start,
    until,
    areaId,
    areaName,
    setCurrentPage,
    setIsLoading,
    setLimit,
    setLog,
    setTotal,
    setFromWhatsappNode,
    setStart,
    setUntil,
    setArea,
    total,
  } = useWhatsappLogAreaStore();

  /** @type {WhatsappSettingState} */
  const { whatsappNodes } = useWhatsappSettingStore();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const areaPickerFilter = useRef();

  const prefetch = async () => {
    try {
      setIsLoading(true);
      const response = await whatsappLogRepository.getWhatsappLog({
        page: currentPage,
        limit,
        fromWhatsappNode,
        start: start.format('yyyy-MM-dd'),
        until: until.format('yyyy-MM-dd'),
      });
      setLog(response.data);
      setTotal(response.total);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const prefetchDebouncer = useDebouncedCallback(prefetch, 600);

  const handlerSetPage = (e, n) => {
    setCurrentPage(n);
  };

  const handlerSetLimit = (e) => {
    setLimit(e.target.value);
  };

  async function pickArea() {
    /** @type {{_id: string; name: string}} */
    const area = await areaPickerFilter.current.open();
    if (!area) return;
    setArea({ areaName: area.name, areaId: area._id });
  }

  useEffect(() => {
    prefetchDebouncer();
  }, [currentPage, limit]);

  useEffect(() => {
    setCurrentPage(0);
    prefetchDebouncer();
  }, [fromWhatsappNode, start, until, areaId]);

  return (
    <div className="tw-w-full">
      <Stack>
        <Grid container spacing={2} className="tw-w-full">
          <Grid xs={12} item>
            <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-w-full tw-gap-2">
              <span className="tw-text-lg tw-font-semibold tw-whitespace-nowrap">Log Area</span>
              <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-end tw-gap-3 tw-w-full">
                <div className="tw-w-full tw-max-w-full md:tw-max-w-48">
                  <DatePicker
                    label="Mulai"
                    value={dayjs(start)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    onChange={(date) => {
                      setStart(date.toDate());
                    }}
                  />
                </div>
                <div className="tw-w-full tw-max-w-full md:tw-max-w-48">
                  <DatePicker
                    label="Sampai"
                    value={dayjs(until)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    onChange={(date) => {
                      setUntil(date.toDate());
                    }}
                  />
                </div>
                <div className="tw-w-full tw-max-w-full md:tw-max-w-52">
                  <TextField
                    label="Whatsapp Node"
                    size="small"
                    fullWidth
                    select
                    onChange={(e) => setFromWhatsappNode(e.target.value)}
                    value={fromWhatsappNode}
                  >
                    <MenuItem value="">Semua</MenuItem>
                    {whatsappNodes.map((node) => (
                      <MenuItem key={node._id} value={node._id}>
                        {node.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
                <div className="tw-w-full tw-max-w-full md:tw-max-w-48">
                  <TextField
                    label="Area"
                    size="small"
                    fullWidth
                    value={areaName?.nullIfEmpty() ?? 'semua'}
                    InputProps={{ readOnly: true }}
                    onClick={() => pickArea()}
                  />
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
        <div className="tw-flex tw-flex-col tw-mt-4 tw-w-full tw-space-y-4 tw-relative">
          <Overloading loading={isLoading} />
          {isMobile ? (
            log.map((item, i) => (
              <div key={i} className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
                <Accordion>
                  <AccordionSummary>
                    <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
                      <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-w-full tw-gap-2">
                        <p>{item.fromWhatsappNodeName}</p>
                        {item.isSuccess ? (
                          <Chip label="Success" color="success" />
                        ) : (
                          <Chip label="Failed" color="error" />
                        )}
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="tw-flex tw-flex-col tw-gap-2">
                      <Stack>
                        <span className="tw-text-xs tw-text-gray-500">Whatsapp Node</span>
                        <Stack>
                          <span className="tw-text-xs tw-font-medium">
                            {item.fromWhatsappNodeName}
                          </span>{' '}
                          <span className="tw-text-xs tw-font-medium">
                            {item.fromWhatsappNodeNumber}
                          </span>
                        </Stack>
                      </Stack>
                      <Stack>
                        <span className="tw-text-xs tw-text-gray-500">Message</span>
                        <span className="tw-text-xs tw-font-medium ">{item.message}</span>
                      </Stack>
                      <Stack>
                        <span className="tw-text-xs tw-text-gray-500">Error Reason</span>
                        <span className="tw-text-xs tw-font-medium">{item.errorReason ?? '-'}</span>
                      </Stack>
                    </div>
                  </AccordionDetails>
                </Accordion>
              </div>
            ))
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell className="tw-w-[200px]">From Node</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Error Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {log.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Stack>
                        <span className="tw-text-xs">{item.fromWhatsappNodeName}</span>
                        <span className="tw-text-xs">{item.fromWhatsappNodeNumber}</span>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {item.isSuccess ? (
                        <Chip label="Success" variant="soft" color="success" size="small" />
                      ) : (
                        <Chip label="Failed" variant="soft" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="tw-text-xs">{item.message}</span>
                    </TableCell>
                    <TableCell>{item.errorReason ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <TablePagination
          component="div"
          count={total}
          page={currentPage}
          onPageChange={handlerSetPage}
          rowsPerPage={limit}
          onRowsPerPageChange={handlerSetLimit}
        />
      </Stack>
      <AreaPickerFilter ref={areaPickerFilter} />
    </div>
  );
};

export default WhatsappLogAreaPanel;
