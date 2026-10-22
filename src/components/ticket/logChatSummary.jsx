import { Grid, Stack } from '@mui/material';

/**
 * Summary of chat logs for a ticket.
 * @param {Object} param0
 * @param {Record<string, string>} param0.labelItems - List of label items to display in the summary.
 */
export function LogChatSummary({ labelItems }) {
  const labelKeys = Object.keys(labelItems);

  return (
    <Grid container spacing={2}>
      {labelKeys.map((key) => (
       <Grid item key={key} xs={12} sm={6}>
         <Stack>
          <span className="tw-text-xs tw-text-gray-400">{key}</span>
          <span className="tw-text-xs tw-font-semibold">{labelItems[key]}</span>
        </Stack>
       </Grid>
      ))}
    </Grid>
  );
}
