/**
 * @typedef {import("src/repositories/depositMethod").PaymentMethod} PaymentMethod
 */

import { Iconify } from '@components/iconify';
import { getBankImagePath } from '@utils/getBankImage';

import {
  Chip,
  Stack,
  Button,
  Divider,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  AccordionActions,
} from '@mui/material';

import 'src/extension/string';
/**
 * @param {{item: PaymentMethod, onEdit: void; onRemove: (data) => void}} props -- react props
 */
export default function PaymentMethodMobileCard({ item, onEdit, onRemove }) {
  const headers = ['Keterangan', 'Jenis', 'Status'];
  return (
    <div className="tw-ring-1 tw-ring-gray-400 tw-w-full tw-rounded-md">
      <Accordion className="tw-w-full">
        <AccordionSummary className="tw-w-full">
          <Stack spacing={1} className="tw-w-full">
            <div className="tw-w-full tw-flex tw-flex-row tw-items-center tw-justify-between tw-uppercase">
              <Chip label={item.paymentMethod} size="small" variant="outlined" color="primary" />
              <Chip
                label={item.status}
                size="small"
                variant="outlined"
                color={item.status.toLowerCase() === 'active' ? 'success' : 'error'}
              />
            </div>
            <Divider />
            <span className="tw-text-xs tw-font-semibold">{item.title}</span>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              {item.bankName && (
                <img
                  src={`/assets/bank/${getBankImagePath(item.bankName)}`}
                  alt={item.bankName}
                  className="tw-h-8"
                />
              )}{' '}
              <Stack>
                <span className="tw-text-xs">{item?.bankUsername ?? ''}</span>
                <span className="tw-text-xs">{item?.bankNumber ?? ''}</span>
              </Stack>
            </Stack>
            <Stack>
              <FormControlLabel
                control={<Checkbox checked={item?.showAndroid ?? false} size="small" readOnly />}
                label="Show Android"
              />
              <FormControlLabel
                control={<Checkbox checked={item?.isAuto} size="small" readOnly />}
                label="Otomatis"
              />
              <FormControlLabel
                control={<Checkbox checked={item?.isManual} size="small" readOnly />}
                label="Manual"
              />
            </Stack>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <div className="tw-flex tw-flex-row tw-gap-2">
            <Button
              onClick={() => onEdit(item)}
              variant="text"
              color="success"
              size="small"
              className="tw-flex tw-flex-row tw-gap-2"
            >
              <Iconify icon="material-symbols:edit-outline" fontSize={24} />
            </Button>
            <Button
              onClick={() => onRemove(item)}
              variant="text"
              color="error"
              size="small"
              className="tw-flex tw-flex-row tw-gap-2"
            >
              <Iconify icon="material-symbols:delete" fontSize={24} />
            </Button>
          </div>
        </AccordionActions>
      </Accordion>
    </div>
  );

  // return (
  //   <Accordion>
  //     <AccordionSummary>
  //       <Table>
  //         <TableHead>
  //           <TableRow>
  //             {headers.map((h, i) => (
  //               <TableCell key={i}>{h}</TableCell>
  //             ))}
  //           </TableRow>
  //         </TableHead>
  //         <TableBody>
  //           <TableRow>
  //             <TableCell>
  //               <span className="tw-text-xs">{item?.title?.toCapitalCase()}</span>
  //             </TableCell>
  //             <TableCell>
  //               <span className="tw-text-xs">{item?.paymentMethod?.toCapitalCase()}</span>
  //             </TableCell>
  //             <TableCell>
  //               <span className="tw-text-xs">{item?.status?.toCapitalCase()}</span>
  //             </TableCell>
  //           </TableRow>
  //         </TableBody>
  //       </Table>
  //     </AccordionSummary>
  //     <AccordionActions>
  //       <div className="tw-flex tw-flex-row tw-gap-2">
  //         <Button
  //           onClick={() => onEdit(item)}
  //           variant="text"
  //           color="success"
  //           size="small"
  //           className="tw-flex tw-flex-row tw-gap-2"
  //         >
  //           <Icon icon="material-symbols:edit-outline" fontSize={24} />
  //         </Button>
  //         <Button
  //           onClick={() => onRemove(item)}
  //           variant="text"
  //           color="error"
  //           size="small"
  //           className="tw-flex tw-flex-row tw-gap-2"
  //         >
  //           <Icon icon="material-symbols:delete" fontSize={24} />
  //         </Button>
  //       </div>
  //     </AccordionActions>
  //   </Accordion>
  // );
}
