/**
 * @typedef {import("src/repositories/xlsx").ODPTemplateValidation} ODPTemplateValidation
 */

import { useMemo } from 'react';
import { proxyMapper } from '@utils/proxyMapper';

import { DataGrid } from '@mui/x-data-grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Chip,
  Stack,
  Divider,
  useTheme,
  Accordion,
  Typography,
  useMediaQuery,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { datagridStyle } from 'src/helpers/style.helper';

export function ImportODPEntryTab({ items, error = false }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  return mobile ? (
    <ImportODPEntryAccordion items={items} error={error} />
  ) : (
    <ImportODPEntryDatatable items={items} error={error} />
  );
}

function ImportODPEntryDatatable({ items, error }) {
  const mappedItems = useMemo(() => items.map((item, i) => ({ ...item, id: i })), [items]);

  /** @type {ODPTemplateValidation} */
  const property = proxyMapper();

  /** @type {import('@mui/x-data-grid').GridColDef<ODPTemplateValidation>} */
  const columns = [
    {
      field: property.odpName,
      headerName: 'ODP',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs tw-font-semibold">{row[property.odpName]}</span>
        </Stack>
      ),
    },
    {
      field: property.areaTitle,
      headerName: 'Area',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs">{row[property.areaTitle]}</span>
        </Stack>
      ),
    },
    {
      field: property.port,
      headerName: 'Jumlah Port',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs">{row[property.port]}</span>
        </Stack>
      ),
    },
    {
      field: property.lat,
      headerName: 'Location',
      flex: 1,
      renderCell: ({ row }) => (
        <Stack>
          <span className="tw-text-xs">Lat: {row[property.lat]}</span>
          <span className="tw-text-xs">Lng: {row[property.lng]}</span>
        </Stack>
      ),
    },
    error
      ? {
          field: property.error,
          headerName: 'Error',
          flex: 1,
          renderCell: ({ row }) => (
            <Chip label={row[property.error] ?? '-'} color="error" size="small" />
          ),
        }
      : {},
  ];

  return (
    <div style={{ width: '100%', height: 400 }}>
      <DataGrid
        columns={columns}
        rows={mappedItems}
        columnBufferPx={10}
        getRowClassName={() => 'tw-text-xs tw-bg-white'}
        pageSizeOptions={[10, 25, 50]}
        disableColumnMenu
        getRowHeight={() => 'auto'}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        sx={{
          ...datagridStyle.verticalCenter,
          ...datagridStyle.disabledHover,
          ...datagridStyle.disabledSelected,
        }}
      />
    </div>
  );
}

function ImportODPEntryAccordion({ items, error }) {
  const mappedItems = useMemo(() => items.map((item, i) => ({ ...item, id: i })), [items]);

  /** @type {ODPTemplateValidation} */
  const property = proxyMapper();

  return (
    <Box sx={{ width: '100%' }}>
      {mappedItems.map((row) => (
        <Accordion key={row.id} sx={{ mb: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: 'grey.50',
              '&:hover': { backgroundColor: 'grey.100' },
            }}
          >
            <Stack sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {row[property.odpName]}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {/* Area Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Area
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">{row[property.areaTitle]}</Typography>
                </Stack>
              </Box>

              <Divider />

              {/* Port Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Jumlah Port
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">{row[property.port]}</Typography>
                </Stack>
              </Box>

              <Divider />

              {/* Location Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Location
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">Lat: {row[property.lat]}</Typography>
                  <Typography variant="body2">Lng: {row[property.lng]}</Typography>
                </Stack>
              </Box>

              {/* Error Information (if applicable) */}
              {error && row[property.error] && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Error
                    </Typography>
                    <Chip
                      label={row[property.error]}
                      color="error"
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Box>
                </>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
