import { Field } from '@components/hook-form';

import { Stack } from '@mui/material';

/**
 * @param {{
 *   methods: any;
 *   availableSelectEngineer: { label: string; value: string }[];
 * }} props
 */
export default function TeknisiTab({ methods, availableSelectEngineer }) {
  return (
    <Stack spacing={2}>
      <Field.MultiSelect
        name="engineers"
        label="Pilih Tim Pemasangan"
        size="small"
        options={availableSelectEngineer}
      />
    </Stack>
  );
}
