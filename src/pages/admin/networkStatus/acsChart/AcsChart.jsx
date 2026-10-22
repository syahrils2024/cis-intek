import { Grid, Stack } from '@mui/material';

import AcsPieChart from './components/PieChart';
import AcsChartFilter from './components/Filter';
import { useAcsChartState } from './acsChart.state';

export default function AcsChart() {
  const { state, handlers } = useAcsChartState();
  return (
    <Stack spacing={3}>
      <AcsChartFilter
        areaName={state.areaName}
        onPickArea={handlers.pickArea}
        areaErrorMessage={state.areaErrorMessage}
        loading={state.loading.value}
      />
      {/* Chart Content */}
      <Grid container spacing={2}>
        {state.data.map((item, i) => <Grid item xs={12} md={6} lg={4} key={i}>
          <AcsPieChart data={item} />
        </Grid>)}
      </Grid>
      {/* {state.data.length > 0 ? <AcsPieChart data={state.data[0]} /> : null} */}
      {/* End Chart Content */}
    </Stack>
  );
}
