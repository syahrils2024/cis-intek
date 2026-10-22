/**
 * @typedef {import("./table").Inventory} Inventory
 */

import { Icon } from '@iconify/react';

import {
  Chip,
  Stack,
  Table,
  Button,
  TableRow,
  Accordion,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
} from '@mui/material';
/**
 * @param {{item:Inventory; onShowMenu: void; readOnly: boolean}} props -- React Props
 */
export function InventoryMobileCard({ item, onShowMenu, readOnly = false }) {
  const headers = ['Total', 'Digunakan', 'Tersisa'];
  return (
    <Accordion>
      <AccordionSummary>
        <div className="tw-w-full tw-flex tw-flex-row tw-items-start tw-justify-between">
          <Stack>
            <Typography variant="overline">{item.name}</Typography>
            <Typography variant="caption">{item.description}</Typography>
          </Stack>
          <Chip label={item.unitType} className="tw-w-min" size="small" />
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((h, i) => (
                <TableCell key={i}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{item.stock}</TableCell>
              <TableCell>{item.usage}</TableCell>
              <TableCell>{item.available}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {/* <Stack spacing={0.5}>
          <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
            <Chip label="Total" color="info" size="small" />{' '}
            <Typography variant="body1">{item.stock}</Typography>
          </div>
          <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
            <Chip label="Digunakan" color="success" size="small" />{' '}
            <Typography variant="body1">{item.usage}</Typography>
          </div>
          <div className="tw-flex tw-flex-row tw-gap-2 tw-items-center">
            <Chip label="Tersisa" color="warning" size="small" />{' '}
            <Typography variant="body1">{item.available}</Typography>
          </div>
        </Stack> */}
      </AccordionDetails>
      {!readOnly && (
        <AccordionActions>
          <Button onClick={onShowMenu} color="primary" variant="contained">
            <Icon icon="ic:baseline-menu" className="tw-mr-2" />
            Action
          </Button>
        </AccordionActions>
      )}
    </Accordion>
  );
}
