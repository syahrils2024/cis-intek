import { Stack, Button, Checkbox, MenuItem, TextField, FormControlLabel } from '@mui/material';

/**
 * @typedef {import('src/repositories/broadcastTemplate').BroadcastTemplate} BroadcastTemplate
 */

/**
 * @param {{
 * areaTitle: string;
 * areaId: string;
 * onPickArea: Function;
 * template: string;
 * templateList: BroadcastTemplate[];
 * onChangeTemplate: Function;
 * billingStatus: string[];
 * onChangeBillingStatus: Function;
 * onChangeSendInvoice: Function;
 * onChangeSendSpecial: Function;
 * sendInvoice: boolean;
 * sendSpecial: boolean;
 * iteration: number;
 * onRemove: Function;
 * }} param0
 * @returns
 */
export default function WhatsappBroadcastFormRulesItem({
  areaTitle = '',
  onPickArea,
  template = '',
  templateList = [],
  onChangeTemplate,
  billingStatus = [],
  onChangeBillingStatus,
  sendInvoice = true,
  onChangeSendInvoice,
  sendSpecial = false,
  onChangeSendSpecial,
  onRemove,
  iteration = 1,
}) {
  const statuses = [
    {
      label: 'Paid',
      value: 'paid',
    },
    {
      label: 'Unpaid',
      value: 'unpaid',
    },
    {
      label: 'Partially Paid',
      value: 'partially_paid',
    },
    {
      label: 'Canceled',
      value: 'canceled',
    },
  ];

  function toggleItem(value) {
    const isExist = billingStatus.includes(value);
    if (isExist) {
      onChangeBillingStatus(billingStatus.filter((v) => v !== value));
    } else {
      onChangeBillingStatus([...billingStatus, value]);
    }
  }

  return (
    <div className="tw-relative tw-p-5 tw-ring-1 tw-ring-gray-400 tw-rounded-md">
      <div className="tw-absolute -tw-top-4 tw-ring-primary tw-ring-1 tw-bg-gray-200 tw-left-5 tw-p-2 tw-rounded-md tw-text-xs tw-font-medium">
        Area {iteration}
      </div>
      <Stack className="tw-w-full tw-pt-4" spacing={2}>
        {/* Area And Template */}
        <div className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-4">
          <TextField
            label="Area / POP"
            fullWidth
            size="small"
            value={areaTitle}
            InputProps={{ readOnly: true }}
            onClick={onPickArea}
          />
          <TextField
            label="Template"
            fullWidth
            size="small"
            value={template}
            InputLabelProps={{ shrink: true }}
            SelectProps={{ displayEmpty: true }}
            onChange={(e) => onChangeTemplate(e.target.value)}
            select
          >
            <MenuItem value="">Pilih Template</MenuItem>
            {templateList.map((item, i) => (
              <MenuItem key={i} value={item._id}>
                {item.title}
              </MenuItem>
            ))}
          </TextField>
        </div>
        {/* End Area And Template */}
        <div className="tw-flex tw-flex-wrap tw-gap-2">
          {statuses.map((status) => (
            <FormControlLabel
              key={status.value}
              label={status.label}
              control={
                <Checkbox
                  checked={billingStatus.includes(status.value)}
                  onClick={() => toggleItem(status.value)}
                />
              }
            />
          ))}
          <FormControlLabel
            label="Pelanggan Spesial"
            control={
              <Checkbox checked={sendSpecial} onClick={() => onChangeSendSpecial(!sendSpecial)} />
            }
          />
          <FormControlLabel
            label="Invoice"
            control={
              <Checkbox checked={sendInvoice} onClick={() => onChangeSendInvoice(!sendInvoice)} />
            }
          />
        </div>
        {!!onRemove ? (
          <Stack direction="row" justifyContent="end">
            <Button color="error" onClick={onRemove} size="small" variant="soft">
              Hapus
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </div>
  );
}
