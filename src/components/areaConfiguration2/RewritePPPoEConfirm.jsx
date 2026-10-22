import { Stack, Checkbox, FormControlLabel } from '@mui/material';

/**
 * @param {object} props
 * @param {string} props.description - Description of the PPPoE rewrite operation to be displayed in the confirmation dialog.
 * @param {boolean} props.rewriteSecret - Whether the "Rewrite Secret" option is selected.
 * @param {boolean} props.rewriteInterface - Whether the "Rewrite Interface" option is selected.
 * @param {function} props.onChangeRewriteSecret - Callback function to be called when the "Rewrite Secret" option is toggled.
 * @param {function} props.onChangeRewriteInterface - Callback function to be called when the "Rewrite Interface" option is toggled.
 * @returns {JSX.Element} A confirmation dialog component for the PPPoE rewrite operation.
 */
export default function RewritePPPoEConfirm({
  description,
  rewriteSecret,
  rewriteInterface,
  onChangeRewriteSecret,
  onChangeRewriteInterface,
}) {
  return (
    <Stack spacing={2}>
      <span className="tw-text-xs">{description}</span>
      <Stack>
        <FormControlLabel
          label="Rewrite Secret"
          control={
            <Checkbox
              checked={rewriteSecret}
              onChange={(e) => onChangeRewriteSecret(e.target.checked)}
            />
          }
        />
        <FormControlLabel
          label="Rewrite Interface"
          control={
            <Checkbox
              checked={rewriteInterface}
              onChange={(e) => onChangeRewriteInterface(e.target.checked)}
            />
          }
        />
      </Stack>
    </Stack>
  );
}
