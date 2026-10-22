/**
 * @typedef {import("src/repositories/faq").Faq} Faq
 */

import { Iconify } from '@components/iconify';
import { useExpansionToggle } from '@hooks/use-expansion-toggle';

import {
  Chip,
  Table,
  Stack,
  Tooltip,
  Divider,
  TableRow,
  Checkbox,
  TableCell,
  TableHead,
  TableBody,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';

export const FaqData = {
  Table: FaqDataTable,
  Mobile: FaqDataMobile,
};

/**
 * @typedef {Object} FaqDataTableProps
 * @property {Faq[]} data - The list of FAQs to display.
 * @property {(f: Faq) => void} onEdit - Callback function to handle editing an FAQ.
 * @property {(f: Faq) => void} onRemove - Callback function to handle removing an FAQ.
 */

/**
 *
 * @param {FaqDataTableProps} props
 */
function FaqDataTable({ data, onEdit, onRemove }) {
  const headers = ['Judul', 'Konten', 'Aktif', 'Panduan Troubleshooting', ''];
  const expansionData = useExpansionToggle();

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header, index) => (
            <TableCell key={index}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((faq) => (
          <TableRow key={faq._id}>
            <TableCell width={300}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  onClick={() => expansionData.toggle(faq._id)}
                  className={`tw-duration-300 ${
                    expansionData.isIncludes(faq._id) ? 'tw-rotate-90' : 'tw-rotate-0'
                  }`}
                >
                  <Iconify icon="ic:sharp-arrow-right" />
                </IconButton>
                <span className="tw-text-xs">{faq.question}</span>
              </Stack>
            </TableCell>
            <TableCell>
              <span
                className={[
                  'tw-text-xs',
                  expansionData.isIncludes(faq._id) ? 'tw-whitespace-pre-line' : '',
                ].join(' ')}
              >
                {faq.answer}
              </span>
            </TableCell>
            <TableCell>
              <Checkbox checked={faq.isActive} />
            </TableCell>
            <TableCell>
              <Checkbox checked={faq.isTechnical} />
            </TableCell>
            <TableCell width={100}>
              <Tooltip title="Edit">
                <IconButton disabled={!onEdit} color="success" onClick={() => onEdit(faq)}>
                  <Iconify icon="mdi:pencil" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Hapus">
                <IconButton disabled={!onRemove} color="error" onClick={() => onRemove(faq)}>
                  <Iconify icon="mdi:delete" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * @param {FaqDataTableProps} param0
 */
function FaqDataMobile({ data, onEdit, onRemove }) {
  return data.map((faq, index) => (
    <div key={index} className="tw-ring-1 tw-ring-gray-400 tw-rounded-md">
      <Accordion>
        <AccordionSummary>
          <Stack spacing={2}>
            <div className="tw-flex tw-flex-wrap tw-gap-2">
              {!faq.isTechnical ? (
                <Chip label="Panduan Troubleshooting" size="small" color="primary" variant="soft" />
              ) : null}
              {faq.isActive ? (
                <Chip label="Aktif" size="small" color="success" variant="filled" />
              ) : (
                <Chip label="Inactive" size="small" color="error" variant="soft" />
              )}
            </div>
            <Divider />
            <span className="tw-text-xs">{faq.question}</span>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <span className="tw-text-xs tw-whitespace-pre-line">{faq.answer}</span>
        </AccordionDetails>
        <AccordionActions>
          <Tooltip title="Hapus">
            <IconButton disabled={!onRemove} color="error" onClick={() => onRemove(faq)}>
              <Iconify icon="mdi:delete" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton disabled={!onEdit} color="success" onClick={() => onEdit(faq)}>
              <Iconify icon="mdi:pencil" />
            </IconButton>
          </Tooltip>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}
