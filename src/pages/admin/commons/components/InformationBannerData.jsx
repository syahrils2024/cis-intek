/** @typedef {import("src/repositories/bannerInformation").BannerInformation} BannerInformation */

import { Iconify } from '@components/iconify';

import {
  Chip,
  Table,
  Stack,
  Tooltip,
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

export const InformationBannerData = {
  Table: InformationBannerDataTable,
  Mobile: InformationBannerMobile,
};

/**
 * @typedef {Object} InformationBannerProps
 * @property {BannerInformation[]} data
 * @property {Function} onEdit
 * @property {Function} onRemove
 */

/** @param {InformationBannerProps} */
function InformationBannerMobile({ data, onEdit, onRemove }) {
  return data?.map((d, i) => (
    <div key={i} className="tw-ring-1 tw-ring-gray-400 tw-rounded-md">
      <Accordion>
        <AccordionSummary>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignContent="center"
            className="tw-w-full"
            alignItems="center"
          >
            <span className="tw-text-xs">{d.title}</span>
            <Checkbox readOnly checked={d.show} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Stack>
              <span className="tw-text-xs">Jenis</span>
              <span className="tw-text-xs">{InformationBannerType(d.type)}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Deskripsi</span>
              <span className="tw-text-xs tw-whitespace-pre-line">{d.description}</span>
            </Stack>
            <Stack>
              <span className="tw-text-xs">Area</span>
              {d.area.length <= 0 ? (
                <span className="tw-text-xs">Semua</span>
              ) : (
                d.area.map((a, j) => (
                  <Chip
                    className="tw-w-min"
                    key={j}
                    label={a.title}
                    color="success"
                    variant="soft"
                    size="small"
                  />
                ))
              )}
            </Stack>
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title="Hapus">
              <IconButton disabled={!onRemove} color="error" onClick={() => onRemove(d)}>
                <Iconify icon="mdi:close" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton disabled={!onEdit} color="success" onClick={() => onEdit(d)}>
                <Iconify icon="mdi:pencil" />
              </IconButton>
            </Tooltip>
          </Stack>
        </AccordionActions>
      </Accordion>
    </div>
  ));
}

/** @param {InformationBannerProps} */
function InformationBannerDataTable({ data, onEdit, onRemove }) {
  const headers = ['Judul', 'Jenis', 'Deskripsi', 'Area', 'Show', ''];
  const isDataEmpty = (data ?? []).length <= 0;

  return (
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {isDataEmpty ? (
          <TableRow>
            <TableCell
              colSpan={headers.length}
              className="tw-text-xs tw-text-center tw-mx-auto tw-w-full tw-items-center tw-justify-center"
              sx={{ textAlign: 'center' }}
            >
              <span className="tw-text-xs">Belum ada data</span>
            </TableCell>
          </TableRow>
        ) : null}
        {data?.map((d, i) => (
          <TableRow key={i}>
            <TableCell>
              <span className="tw-text-xs">{d.title}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs">{InformationBannerType(d.type)}</span>
            </TableCell>
            <TableCell>
              <span className="tw-text-xs tw-whitespace-pre-line">{d.description}</span>
            </TableCell>
            <TableCell>
              <div className="tw-flex tw-flex-wrap tw-gap-2">
                {d.area.length <= 0 ? (
                  <span className="tw-text-xs">Semua</span>
                ) : (
                  d.area.map((a, j) => (
                    <Chip
                      key={j}
                      label={a.title}
                      color="success"
                      variant="soft"
                      className="tw-w-min"
                    />
                  ))
                )}
              </div>
            </TableCell>
            <TableCell>
              <Checkbox readOnly checked={d.show} />
            </TableCell>
            <TableCell width={100}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title="Hapus">
                  <IconButton disabled={!onRemove} color="error" onClick={() => onRemove(d)}>
                    <Iconify icon="mdi:close" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton disabled={!onEdit} color="success" onClick={() => onEdit(d)}>
                    <Iconify icon="mdi:pencil" />
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

function InformationBannerType(type) {
  const result =
    {
      info: 'Informasi',
      mass_internet_disorder: 'Gangguan Internet Massal',
    }[type] ?? type;

  return result;
}
