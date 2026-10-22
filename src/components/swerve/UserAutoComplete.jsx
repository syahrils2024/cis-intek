import useSWR from 'swr';

import { TextField, Autocomplete, InputAdornment, CircularProgress } from '@mui/material';

import { userRepository } from 'src/repositories';

/**
 * @typedef {import("src/repositories/user").User} User
 * @param {{
 *  value: User,
 *  onChange: (e: Event, user: User) => void
 *  label?: string
 * }} param0
 */
export default function UserAutoComplete({ value, onChange, label = 'Agent', size = 'small' }) {
  const { data, error, isLoading } = useSWR('/master/users', async () => {
    const adminPromise = userRepository.getUserByPrivilege('admin');
    const engineerPromise = userRepository.getUserByPrivilege('engineer');
    const loPromise = userRepository.getUserByPrivilege('liaison_officer');
    const [admins, engineers, los] = await Promise.all([adminPromise, engineerPromise, loPromise]);
    return [...admins, ...engineers, ...los];
  });

  return (
    <Autocomplete
      fullWidth
      options={data}
      size={size}
      getOptionLabel={(opt) => opt.fullname}
      getOptionKey={(opt) => opt._id}
      isOptionEqualToValue={(opt) => opt._id === value._id}
      value={value}
      onChange={onChange}
      renderInput={(params) => (
        <TextField
          {...params}
          size={size}
          label={label}
          value={value || null}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ? 'Failed to load users' : ''}
          endAdornment={
            <InputAdornment position="start">
              <CircularProgress />
            </InputAdornment>
          }
        />
      )}
    />
  );
}
