/**
 * @typedef {import("src/repositories/duitkuSecret").DuitkuSecret} DuitkuSecret
 */

import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Table,
  Stack,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Accordion,
  IconButton,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

/**
 * @typedef {Object} DataProps
 * @property {DuitkuSecret[]} data
 * @property {(data: DuitkuSecret) => void} onRemove
 * @property {(data: DuitkuSecret) => void} onEdit
 */

export const DuitkuSecretData = {
  Mobile: MobileData,
  Table: TableData,
};

/** @param {DataProps} props */
function MobileData({ data, onEdit, onRemove }) {
  const showSecretKey = useExpansionToggle();

  return data.map((item, i) => (
    <div key={i} className="tw-ring-1 tw-ring-gray-400 tw-rounded-md">
      <Accordion>
        <AccordionSummary>
          <span className="tw-text-xs">{item.secretName}</span>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1} className="tw-w-full">
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs">Merchant Code:</span>
              <span className="tw-text-xs tw-font-medium">{item.merchantCode}</span>
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs">Api Key:</span>
              <SecretKey
                hide={!showSecretKey.isIncludes(item._id)}
                secretKey={item.merchantKey}
                onToggle={() => showSecretKey.toggle(item._id)}
              />
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-xs">Area :</span>
              <ol className="tw-list-disc tw-ml-4">
                {item.areas.map((area) => (
                  <li key={area._id} className="tw-text-xs">
                    {area.title}
                  </li>
                ))}
              </ol>
            </div>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit">
              <IconButton disabled={!onEdit} color="success" onClick={() => onEdit(item)}>
                <Iconify icon="mdi:edit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Hapus">
              <IconButton disabled={!onRemove} color="error" onClick={() => onRemove(item)}>
                <Iconify icon="mdi:delete" />
              </IconButton>
            </Tooltip>
          </Stack>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}

/** @param {DataProps} props */
function TableData({ data, onEdit, onRemove }) {
  const showSecretKey = useExpansionToggle();
  const headers = ['Secret Profile', 'Merchant Code', 'Api Key', 'Area', ''];

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell key={header}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, i) => (
          <TableRow key={i}>
            <TableCell className="tw-text-xs">
              <span className="tw-text-xs">{item.secretName}</span>
            </TableCell>
            <TableCell className="tw-text-xs">
              <span className="tw-text-xs">{item.merchantCode}</span>
            </TableCell>
            <TableCell className="tw-text-xs">
              <span className="tw-text-xs">
                <SecretKey
                  hide={!showSecretKey.isIncludes(item._id)}
                  secretKey={item.merchantKey}
                  onToggle={() => showSecretKey.toggle(item._id)}
                />
              </span>
            </TableCell>
            <TableCell className="tw-text-xs">
              <ol className="tw-list-disc tw-ml-4">
                {item.areas.map((area) => (
                  <li key={area._id} className="tw-text-xs">
                    {area.title}
                  </li>
                ))}
              </ol>
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Edit">
                  <IconButton disabled={!onEdit} color="success" onClick={() => onEdit(item)}>
                    <Iconify icon="mdi:edit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Hapus">
                  <IconButton disabled={!onRemove} color="error" onClick={() => onRemove(item)}>
                    <Iconify icon="mdi:delete" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 *
 * @param {{hide: boolean; secret: string}} param0
 * @returns
 */
function SecretKey({ hide, secretKey, onToggle }) {
  const btn = (
    <IconButton onClick={onToggle}>
      <Iconify icon={hide ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
    </IconButton>
  );

  return (
    <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
      <span className="tw-text-xs">{hide ? '******************' : secretKey}</span>
      {btn}
    </div>
  );
}
