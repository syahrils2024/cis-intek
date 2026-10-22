import { Icon } from '@iconify/react';

import {
  Chip,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

import WhatsappNodeStatusChip from './WhatsappNodeStatusChip';

export default function WhatsappNodeMobileCard({
  data,
  onRestart,
  onRemove,
  onScan,
  onLogout,
  onEdit,
  onUpdate,
  onConsole,
}) {
  return (
    <div className="tw-ring-1 tw-ring-gray-300 tw-rounded-lg">
      <Accordion>
        <AccordionSummary>
          <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
            <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-w-full tw-gap-2">
              <p className="tw-text-xs">{data.title}</p>
              <WhatsappNodeStatusChip status={data.status} />
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Nama Node</span>
              <span className="tw-text-xs tw-font-medium">{data.title}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Phone</span>
              <span className="tw-text-xs tw-font-medium">{data.phone}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Port</span>
              <span className="tw-text-xs tw-font-medium">{data.port}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Nama Perangkat</span>
              <span className="tw-text-xs tw-font-medium">{data.description}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs tw-text-gray-500">Kategori</span>
              <span className="tw-text-xs tw-font-medium tw-flex tw-flex-wrap tw-gap-1">
                {data.groups.map((group, gi) => (
                  <Chip
                    key={gi}
                    size="small"
                    className="tw-me-1"
                    color="primary"
                    label={group.name}
                    variant="outlined"
                  />
                ))}
              </span>
            </Stack>
          </div>
        </AccordionDetails>
        <AccordionActions>
          <div className="tw-flex tw-flex-wrap tw-gap-2 tw-justify-end">
            {/* <Button
              disabled={data.isMaster === true}
              variant="soft"
              color="error"
              onClick={onRemove}
              size="small"
            >
              <Icon icon="mdi:trash-outline" className="tw-mr-2" />
              Hapus
            </Button> */}
            {data.status !== 'pending' && (
              <Button variant="soft" color="error" onClick={onLogout} size="small">
                <Icon icon="material-symbols:logout" className="tw-mr-2" />
                Logout
              </Button>
            )}
            {data.status !== 'active' && (
              <Button variant="soft" color="warning" onClick={onScan} size="small">
                <Icon icon="bx:qr" className="tw-mr-2" />
                Scan
              </Button>
            )}

            <Button variant="soft" color="warning" onClick={onEdit} size="small">
              <Icon icon="material-symbols:edit-outline" className="tw-mr-2" />
              Edit
            </Button>
            <Button variant="soft" color="gray" onClick={onConsole} size="small">
              <Icon icon="mdi-light:console" className="tw-mr-2" />
              Console
            </Button>
            <Button
              disabled={data.isMaster === true}
              variant="soft"
              color="success"
              onClick={onUpdate}
              size="small"
            >
              <Icon
                icon="material-symbols-light:system-update-outline-rounded"
                className="tw-mr-2"
              />
              Update
            </Button>
            <Button variant="soft" color="info" onClick={onRestart} size="small">
              <Icon icon="ic:baseline-restart-alt" className="tw-mr-2" />
              Restart
            </Button>
          </div>
        </AccordionActions>
      </Accordion>
    </div>
  );
}
