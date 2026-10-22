import { InvoiceAnalytic } from '@components/dashboard-card/invoice-analytics';

import { Grid } from '@mui/material';

/**
 * Dashboard summary cards (PPPoE / Net status).
 *
 * @param {object} props
 * @param {object} props.theme
 * @param {number} props.pppActive
 * @param {number} props.pppInactive
 * @param {number} props.totalUnisolated
 * @param {number} props.totalIsolated
 */
export default function NetworkStatusCards({
  theme,
  pppActive,
  pppInactive,
  totalUnisolated,
  totalIsolated,
}) {
  return (
    <div className="tw-p-4">
      <Grid container className="tw-w-full" spacing={2}>
        <Grid xs={12} md={6} lg={3} item>
          <InvoiceAnalytic
            title="PPPoE Aktif"
            subtitle="Jumlah PPPoE Running"
            percent={100}
            price={pppActive}
            icon="bx:wifi"
            color={theme.vars.palette.success.main}
          />
        </Grid>
        <Grid xs={12} md={6} lg={3} item>
          <InvoiceAnalytic
            title="PPPoE Non Aktif"
            subtitle="Jumlah PPPoE Non Aktif"
            percent={100}
            price={pppInactive}
            icon="bx:wifi-off"
            color={theme.vars.palette.error.main}
          />
        </Grid>
        <Grid xs={12} md={6} lg={3} item>
          <InvoiceAnalytic
            title="Net Open"
            subtitle="Jumlah Net Open"
            percent={100}
            price={totalUnisolated}
            icon="fluent:plug-connected-20-regular"
            color={theme.vars.palette.success.main}
          />
        </Grid>
        <Grid xs={12} md={6} lg={3} item>
          <InvoiceAnalytic
            title="Net Isolir"
            subtitle="Jumlah Net Isolir"
            percent={100}
            price={totalIsolated}
            icon="ion:ban"
            color={theme.vars.palette.error.main}
          />
        </Grid>
      </Grid>
    </div>
  );
}
