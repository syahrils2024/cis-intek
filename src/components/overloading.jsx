import { CircularProgress } from '@mui/material';

/**
 * @param {{loading: boolean}} props
 */
export default function Overloading({ loading }) {
  return (
    loading && (
      <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-white/80 tw-z-20">
        <CircularProgress color="primary" />
      </div>
    )
  );
}
