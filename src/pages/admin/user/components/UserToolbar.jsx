import { Icon } from '@iconify/react';

import Grid from '@mui/material/Unstable_Grid2';
import { Button, useTheme, TextField, Typography, useMediaQuery } from '@mui/material';

/**
 * @param {Object} props
 * @param {string} props.search
 * @param {(value: string) => void} props.onSearchChange
 * @param {boolean} props.allowCreate
 * @param {() => void} props.onAdd
 */
export default function UserToolbar({ search, onSearchChange, allowCreate, onAdd }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid columns={12} className="tw-w-full">
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-2">
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-gap-2 tw-w-full">
          <Typography variant="h6">User Management</Typography>
          <Button
            disabled={!allowCreate}
            variant="contained"
            color="primary"
            className="tw-pt-4"
            onClick={onAdd}
          >
            <Icon icon="ic:baseline-add" className="tw-mx-1" />
            {!isMobile && 'Add User'}
          </Button>
        </div>
        <div className="tw-w-full md:tw-w-48">
          <TextField
            value={search}
            label="Cari"
            size="small"
            fullWidth
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </Grid>
  );
}
