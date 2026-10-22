
import { Tab, Tabs } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

/**
 * @param {Object} props
 * @param {number} props.selectedTab
 * @param {(tab: number) => void} props.onTabChange
 * @param {string[]} props.tabs
 */
export default function UserTabs({ selectedTab, onTabChange, tabs }) {
  return (
    <Grid columns={12} className="tw-w-full">
      <Tabs value={selectedTab} onChange={(e, val) => onTabChange(val)}>
        {tabs.map((t, i) => (
          <Tab value={i} key={i} label={t} />
        ))}
      </Tabs>
    </Grid>
  );
}
