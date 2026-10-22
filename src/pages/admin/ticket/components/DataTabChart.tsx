// @ts-nocheck

import { InvoiceAnalytic } from '@components/dashboard-card/invoice-analytics';

import { Grid, ButtonBase } from '@mui/material';

const DataTabChart = ({ ticketDashboardChart }) => (
  <Grid container spacing={2} className="tw-mb-4">
    {ticketDashboardChart?.map((item, i) => (
      <Grid item xs={12} md={3} key={i}>
        <ButtonBase className='tw-w-full tw-text-left' onClick={item.onClick}>
          <InvoiceAnalytic
            key={i}
            color={item.color}
            title={item.title}
            total={item.total}
            icon={item.icon}
            subtitle={item.subtitle}
            percent={100}
          />
        </ButtonBase>
      </Grid>
    ))}
  </Grid>
);

export default DataTabChart;
