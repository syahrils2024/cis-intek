// @ts-nocheck

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { BarChart } from 'src/components/chart/bar-chart';

const MASKED_TEXT = 'Rp ***.***';

export default function MonthlySalesChart({ title = '', categories, series, showFinanceData = true }) {
  if (!(series.length >= 0)) return null;

  if (!showFinanceData) {
    return (
      <Card>
        <CardHeader title={title} />
        <Stack spacing={1} sx={{ px: 3, pb: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
            {MASKED_TEXT}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Data keuangan disembunyikan.
          </Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <BarChart
      title={title}
      chart={{
        categories,
        series,
      }}
    />
  );
}
