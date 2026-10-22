import { connect } from 'react-redux';
import { Iconify } from '@components/iconify';
import { Form, Field } from '@components/hook-form';
import MapsPickerDialog from '@components/mapsPicker/Maps';
import { Fragment, forwardRef, useImperativeHandle } from 'react';
import { OpenIsolirInvoiceTempField } from '@components/areaConfiguration/serverFormDialog/OpenIsolirInvoiceTemp';
import { OpenIsolirPaymentRequestField } from '@components/areaConfiguration/serverFormDialog/OpenIsolirPaymentRequest';

import { TabPanel, TabContext } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Step,
  Stack,
  Button,
  Dialog,
  Select,
  Stepper,
  Divider,
  Tooltip,
  useTheme,
  MenuItem,
  Checkbox,
  StepLabel,
  TextField,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  useMediaQuery,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { PPPoEInterface } from './PppoeInterface';
import { useServerFormDialogState } from './serverFormDialogNext.state';

/**
 * @typedef {import('src/repositories/whatsappGroup').WhatsappGroup} WhatsappGroup
 * @typedef {import('src/repositories/area').Area} Area
 * @typedef {import('src/repositories/broadcastTemplate').BroadcastTemplate} BroadcastTemplate
 */

/**
 * @param {{
 * onSubmit: (data: any) => void;
 * templates: BroadcastTemplate[]
 * }} props
 */
const ServerFormDialogNext = forwardRef(({ templates }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const state = useServerFormDialogState(templates);

  // Expose open method via ref
  useImperativeHandle(ref, () => ({
    open: (id = null, duplicate = false) => state.openDialog(id, duplicate),
  }));

  return (
    <>
      <Form methods={state.methods}>
        <Dialog
          open={state.showDialog.value}
          onClose={state.closeDialog}
          fullWidth
          maxWidth="sm"
          fullScreen={isMobile}
        >
          <DialogTitle>Area Server Form</DialogTitle>
          <DialogContent>
            <TabContext value={state.selectedTab}>
              <Stepper activeStep={parseInt(state.selectedTab)} alternativeLabel>
                {state.tabList.map((label, i) => (
                  <Step key={i} onClick={() => state.setSelectedTab(i.toString())}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Tab 0: Pengaturan Server */}
              <TabPanel value="0">
                <Stack className="tw-py-2" spacing={2}>
                  {/* Area Identity */}
                  <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-relative tw-my-2 tw-p-5">
                    <span className="tw-px-2 tw-absolute -tw-top-3 tw-bg-white tw-text-sm tw-left-3">
                      Area Identity
                    </span>
                    <Stack spacing={2}>
                      <Field.Text name="areaCode" label="Kode Area" size="small" />
                      <Field.Text name="title" label="Nama Server" size="small" />
                      <TextField
                        label="Paste Kordinat Maps"
                        size="small"
                        onChange={(e) => state.seperateLatLng(e.target.value)}
                      />
                      <Grid container spacing={2}>
                        <Grid xs={6}>
                          <Field.Text
                            fullWidth
                            name="lat"
                            label="Lat"
                            size="small"
                            inputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid xs={5}>
                          <Field.Text
                            fullWidth
                            name="lng"
                            label="Lng"
                            size="small"
                            inputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid xs={1}>
                          <IconButton onClick={() => state.showMaps.onTrue()} color="primary">
                            <Iconify icon="mdi:map-marker" />
                          </IconButton>
                        </Grid>
                      </Grid>
                      <Field.Checkbox name="active" label="Active" />
                      <Field.Checkbox
                        name="requiredInstallationReport"
                        label="Wajib Upload Laporan Instalasi"
                      />
                    </Stack>
                  </div>
                  {/* End Area Identity */}
                  {/* End Area Identity */}
                  <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-relative tw-my-2 tw-p-5">
                    <span className="tw-px-2 tw-absolute -tw-top-3 tw-bg-white tw-text-sm tw-left-3">
                      Mikrotik Router Configuration
                    </span>
                    <Stack spacing={2}>
                      <Field.Text name="address" label="IP Address" size="small" />
                      <Field.Text name="port" label="SSH Port" size="small" />
                      <Field.Text name="username" label="Username" size="small" />
                      <Field.Text
                        name="password"
                        label="Password"
                        size="small"
                        type={state.showMikrotikPassword.value ? 'text' : 'password'}
                        SelectProps={{ displayEmpty: true }}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          readOnly: !state.editMikrotikPassword.value,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={state.editMikrotikPassword.value ? 'Edit' : 'Cancel'}>
                                <IconButton
                                  onClick={() => state.editMikrotikPassword.onToggle()}
                                  edge="end"
                                >
                                  <Iconify
                                    icon={
                                      state.editMikrotikPassword.value
                                        ? 'material-symbols:close'
                                        : 'tabler:edit'
                                    }
                                  />
                                </IconButton>
                              </Tooltip>

                              {state.editMikrotikPassword.value ? (
                                <IconButton
                                  onClick={() => state.showMikrotikPassword.onToggle()}
                                  edge="end"
                                >
                                  <Iconify
                                    icon={
                                      state.showMikrotikPassword.value
                                        ? 'solar:eye-bold'
                                        : 'solar:eye-closed-bold'
                                    }
                                  />
                                </IconButton>
                              ) : null}
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormControlLabel
                        label="Dynamic IP Address"
                        control={
                          <Checkbox
                            checked={state.dynamicCustomerIp.value}
                            onChange={(e) => state.dynamicCustomerIp.setValue(e.target.checked)}
                          />
                        }
                      />
                      {state.dynamicCustomerIp.value ? (
                        <Stack direction="row" spacing={1}>
                          <Field.Text
                            name="lastIP"
                            label="IP Pelanggan PSB Terakhir"
                            size="small"
                            fullWidth
                          />
                          <TextField
                            label="IP Pelanggan PSB Selanjutnya"
                            size="small"
                            value={state.nextIpAddress}
                            fullWidth
                            inputProps={{ readOnly: true }}
                          />
                        </Stack>
                      ) : null}
                      <Field.Text name="defaultVlan" label="Default Vlan" size="small" />
                      <Field.Checkbox
                        name="writeStaticInterfacePSB"
                        label="Static Interface PPPoE Mikrotik"
                      />
                      {state.staticInterfacePSB.value ? (
                        <PPPoEInterface
                          value={state.pppoeInterfaceFormat}
                          onChange={state.setPPPoEInterfaceFormat}
                        />
                      ) : null}
                    </Stack>
                  </div>

                  {/* ACS */}
                  <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-relative tw-my-2 tw-p-5">
                    <span className="tw-px-2 tw-absolute -tw-top-3 tw-bg-white tw-text-sm tw-left-3">
                      ACS Connection
                    </span>
                    <Field.Text name="acsUrl" label="Acs URL" size="small" />
                  </div>
                  {/* END ACS */}
                  <div className="tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-relative tw-my-2">
                    <span className="tw-px-2 tw-absolute -tw-top-3 tw-bg-white tw-text-sm tw-left-3">
                      PRTG Credentials
                    </span>
                    <Grid container spacing={2} className="tw-p-5">
                      <Grid item columns={12} xs={12}>
                        <Field.Text
                          name="prtgUrl"
                          label="PRTG URL"
                          size="small"
                          SelectProps={{ displayEmpty: true }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item columns={12} xs={12} sm={6}>
                        <Field.Text
                          name="prtgUsername"
                          label="PRTG Username"
                          size="small"
                          SelectProps={{ displayEmpty: true }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item columns={12} xs={12} sm={6}>
                        <Field.Text
                          name="prtgPassword"
                          label="PRTG Password"
                          size="small"
                          type={state.showPrtgPassword.value ? 'text' : 'password'}
                          SelectProps={{ displayEmpty: true }}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            readOnly: !state.editPrtgPassword.value,
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title={state.editPrtgPassword.value ? 'Edit' : 'Cancel'}>
                                  <IconButton
                                    onClick={() => state.editPrtgPassword.onToggle()}
                                    edge="end"
                                  >
                                    <Iconify
                                      icon={
                                        state.editPrtgPassword.value
                                          ? 'material-symbols:close'
                                          : 'tabler:edit'
                                      }
                                    />
                                  </IconButton>
                                </Tooltip>
                                {state.editPrtgPassword.value ? (
                                  <IconButton
                                    onClick={() => state.showPrtgPassword.onToggle()}
                                    edge="end"
                                  >
                                    <Iconify
                                      icon={
                                        state.showPrtgPassword.value
                                          ? 'solar:eye-bold'
                                          : 'solar:eye-closed-bold'
                                      }
                                    />
                                  </IconButton>
                                ) : null}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </div>
                </Stack>
              </TabPanel>

              {/* Tab 1: Pengaturan Pelanggan */}
              <TabPanel value="1">
                <Stack className="tw-py-2" spacing={2}>
                  {/* Customer ID */}
                  <div className="tw-flex tw-flex-col tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    <FormControlLabel
                      label="Dynamic ID Pelanggan"
                      className="tw-mb-4"
                      control={
                        <Checkbox
                          checked={state.dynamicCustomerId.value}
                          onChange={(e) => state.dynamicCustomerId.setValue(e.target.checked)}
                        />
                      }
                    />
                    {state.dynamicCustomerId.value ? (
                      <>
                        <Field.Text
                          name="prefixCustomer"
                          label="Prefix ID Pelanggan"
                          size="small"
                          onChange={(e) => {
                            state.setPrefix(e.target.value);
                            state.methods.setValue('prefixCustomer', e.target.value);
                          }}
                        />

                        <FormControlLabel
                          label="Auto Increment"
                          control={
                            <Checkbox
                              checked={state.autoIncrementStatus.value}
                              onChange={(e) => state.autoIncrementStatus.setValue(e.target.checked)}
                            />
                          }
                        />
                        <FormHelperText>
                          centang untuk membuat ID Pelanggan berurutan
                        </FormHelperText>
                        {state.autoIncrementStatus.value && (
                          <Stack direction="row" spacing={1} className="tw-mt-2">
                            <TextField
                              label="Nomor Terakhir"
                              size="small"
                              fullWidth
                              value={state.autoIncrementLastNumber.toString().toNumber()}
                              onChange={(e) =>
                                state.setAutoIncrementLastNumber(
                                  e.target.value.toString().toNumber()
                                )
                              }
                            />
                            <TextField
                              label="Total Digit"
                              size="small"
                              fullWidth
                              value={state.autoIncrementDigit.toString().toNumber()}
                              onChange={(e) =>
                                state.setAutoIncrementDigit(e.target.value.toString().toNumber())
                              }
                            />
                            <TextField
                              label="Contoh Hasil"
                              InputProps={{ readOnly: true }}
                              size="small"
                              fullWidth
                              value={
                                state.prefix +
                                state.autoIncrementLastNumber
                                  .toString()
                                  .padStart(state.autoIncrementDigit, '0')
                              }
                            />
                          </Stack>
                        )}
                      </>
                    ) : null}
                  </div>

                  {/* Dynamic PPPoE Password */}
                  <div className="tw-flex tw-flex-col tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    <FormControlLabel
                      label="Dynamic PPPoE Password"
                      control={
                        <Checkbox
                          size="small"
                          checked={state.isRandomPppoePassword.value}
                          onChange={(e) => state.isRandomPppoePassword.setValue(e.target.checked)}
                        />
                      }
                    />
                    <FormHelperText>
                      centang untuk mengaktifkan PPPoE Password Pelanggan secara dynamic
                    </FormHelperText>
                    {state.isRandomPppoePassword.value ? (
                      <Stack spacing={1} className="tw-mt-4">
                        <TextField
                          label="Type"
                          size="small"
                          fullWidth
                          value={state.randomPPPoEPasswordOption}
                          onChange={(e) => state.setRandomPPPoEPasswordOption(e.target.value)}
                          select
                        >
                          {state.randomPPPoEPasswordOptionList.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                    ) : null}
                    {state.isRandomPppoePassword.value &&
                    state.randomPPPoEPasswordOption === 'numeric' ? (
                      <Stack spacing={1} className="tw-mt-2">
                        <TextField
                          label="Total Digit"
                          size="small"
                          fullWidth
                          value={state.randomPasswordDigit}
                          onChange={(e) =>
                            state.setRandomPasswordDigit(e.target.value.toString().toNumber())
                          }
                        />
                      </Stack>
                    ) : null}
                  </div>

                  {/* Service Type */}
                  <div className="tw-flex tw-flex-col tw-gap-4 tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    <Field.Text name="isPrePaid" label="Jenis Layanan" size="small" select>
                      <MenuItem value={false}>Postpaid/Pascabayar/bayar dibelakang</MenuItem>
                      <MenuItem value>Prepaid/Prabayar/bayar didepan</MenuItem>
                    </Field.Text>

                    <Field.Text name="duoDate" label="Tanggal Jatuh Tempo" size="small" />

                    <Field.Checkbox
                      name="autoIsolirAfterPsb"
                      size="small"
                      label="Isolir Setelah PSB"
                      helperText="Isolir otomatis setelah PSB (ketika pelanggan belum melakukan pembayaran)"
                    />
                  </div>

                  {/* Auto Isolir Settings */}
                  <div className="tw-flex tw-flex-col tw-gap-4 tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    <Stack direction="row" alignItems="start">
                      <Field.Checkbox name="autoIsolir" size="small" />
                      <Stack className="tw-w-full">
                        <Field.Text
                          name="autoIsolirDate"
                          label="Tanggal Auto Isolir"
                          placeholder="Kosongkan apabila tanpa otomatis"
                          size="small"
                          disabled={!state.isAutoIsolir.value}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <FormHelperText className="tw-whitespace-pre-line">
                          Centang dan isi tanggal untuk mengaktifkan auto isolir. {'\n'}
                          isolir akan dilakukan pada jam 23:40.
                        </FormHelperText>
                      </Stack>
                    </Stack>

                    <Divider />
                    <OpenIsolirInvoiceTempField
                      checkedValue={state.openIsolirInvoiceTemp.value}
                      duration={state.openIsolirInvoiceTempDuration}
                      onDurationChange={(newDuration) =>
                        state.setOpenIsolirInvoiceTempDuration(newDuration)
                      }
                      onCheckedChange={(newCheckedValue) =>
                        state.openIsolirInvoiceTemp.setValue(newCheckedValue)
                      }
                    />
                    <OpenIsolirPaymentRequestField
                      checkedValue={state.openTemporaryPaymentRequest.value}
                      onCheckedChange={(newCheckedValue) =>
                        state.openTemporaryPaymentRequest.setValue(newCheckedValue)
                      }
                    />
                    {/* <Stack direction="row" alignItems="start">
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={state.usingMaxDateMonth.value}
                            onChange={(e) => state.usingMaxDateMonth.setValue(e.target.checked)}
                          />
                        }
                      />
                       <Stack className="tw-w-full">
                        <Field.Text
                          name="maxDateMonth"
                          size="small"
                          label="Rule PSB Weida"
                          type="number"
                          disabled={!state.usingMaxDateMonth.value}
                        />
                        {state.usingMaxDateMonth.value ? (
                          <FormHelperText>
                            Mulai tanggal {state.maxDateMonthVal + 1} akan menggenapkan PSB menjadi
                            tanggal 1 di bulan berikutnya
                          </FormHelperText>
                        ) : null}
                      </Stack>
                    </Stack> */}
                  </div>
                  <Divider />

                  {/* Billing Settings */}
                  <div className="tw-flex tw-flex-col tw-gap-4 tw-p-4 tw-ring-1 tw-ring-gray-400 tw-rounded-lg">
                    <span className="tw-text-xs">Billing</span>
                    <Stack direction="row" alignItems="start">
                      <Field.Checkbox name="billingRequireProofOfPayment" size="small" />
                      <Stack className="tw-w-full">
                        <TextField
                          InputProps={{ readOnly: true }}
                          size="small"
                          value="Wajib Upload Resi"
                        />
                        <FormHelperText>
                          Centang agar input pembayaran harus upload bukti transfer / transaksi
                        </FormHelperText>
                        <div className="tw-mt-4" />
                        <Divider />
                        <div className="tw-mb-4" />
                        <Field.Text
                          name="installationCharge"
                          label="Biaya Pemasangan"
                          size="small"
                          onChange={(e) => {
                            state.methods.setValue(
                              'installationCharge',
                              e.target.value.toString().toNumber().formatCurrency()
                            );
                          }}
                        />
                        <FormHelperText>
                          Input biaya pemasangan agar ditagihkan ke pelanggan saat PSB
                        </FormHelperText>
                      </Stack>
                    </Stack>
                  </div>
                </Stack>
              </TabPanel>

              {/* Tab 2: Pengaturan Whatsapp */}
              <TabPanel value="2">
                <Stack spacing={2}>
                  {/* Whatsapp Node Field */}
                  <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">Whatsapp Node</span>
                    </div>
                    <div className="tw-grid tw-grid-cols-12 tw-w-full tw-gap-2">
                      {state.whatsappHooks.map((wh, i) => (
                        <Fragment key={i}>
                          <div className="tw-col-span-12 md:tw-col-span-6">
                            <Select
                              value={state.whatsappHooks[i].whatsappNodeId}
                              onChange={(e) => {
                                state.setWhatsappNodeId(i, e.target.value);
                              }}
                              size="small"
                              fullWidth
                              inputProps={{ 'aria-label': 'Without label' }}
                            >
                              {...(state.whatsappNode ?? []).map((wa, index) => (
                                <MenuItem key={index} value={wa._id}>
                                  {wa.title}
                                </MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div className="tw-col-span-12 md:tw-col-span-6 tw-flex tw-flex-row tw-items-center tw-gap-2">
                            <TextField
                              select
                              fullWidth
                              size="small"
                              color="primary"
                              value={state.whatsappHooks[i].types}
                              label="Kategori"
                              onChange={(e) => state.setOptionWhatsappHooks(i, e.target.value)}
                            >
                              {state.whatsappHooksTypes.map((wht, j) => (
                                <MenuItem key={j} value={wht.value}>
                                  {wht.label}
                                </MenuItem>
                              ))}
                            </TextField>
                            <IconButton color="error" onClick={() => state.removeWhatsappHooks(i)}>
                              <Iconify icon="mdi:minus" />
                            </IconButton>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-w-full">
                      <Button
                        onClick={() => state.addWhatsappHooks()}
                        variant="outlined"
                        color="success"
                        className="tw-w-auto"
                        size="small"
                      >
                        <Iconify icon="mdi:plus" /> Whatsapp Node
                      </Button>
                    </div>
                  </div>
                  <Divider />

                  {/* Whatsapp PSB */}
                  <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">Whatsapp PSB Auto Respon</span>
                    </div>
                    <Field.Text
                      name="whatsappId"
                      label="ChatID Group PSB Internal"
                      size="small"
                      fullWidth
                      helperText="Whatsapp Node PSB"
                    />
                    <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-gap-2">
                      <Field.Checkbox
                        name="allowBroadcast"
                        label={<span className="tw-text-xs">Laporan PSB harian</span>}
                        size="small"
                      />

                      <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-2">
                        <Button
                          onClick={() => {
                            state.testSendWhatsapp(state.methods.getValues('whatsappId'), 'psb');
                          }}
                          color="success"
                          variant="outlined"
                          className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                          size="small"
                        >
                          Kirim Test
                        </Button>
                        <Button
                          onClick={() => {
                            state.checkGroupWhatsappValid(
                              state.methods.getValues('whatsappId'),
                              'psb'
                            );
                          }}
                          color="success"
                          variant="outlined"
                          className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                          size="small"
                        >
                          Check
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Divider />

                  {/* Whatsapp Billing */}
                  <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">
                        Whatsapp Billing Auto Respon Pembayaran
                      </span>
                    </div>
                    <Field.Text
                      name="whatsappIdBilling"
                      label="ChatID Group Billing Internal"
                      size="small"
                      helperText="Whatsapp Node Billing"
                    />
                    <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-2">
                      <Button
                        onClick={() => {
                          state.testSendWhatsapp(
                            state.methods.getValues('whatsappIdBilling'),
                            'billing'
                          );
                        }}
                        color="success"
                        variant="outlined"
                        className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                        size="small"
                      >
                        Kirim Test
                      </Button>
                      <Button
                        onClick={() => {
                          state.checkGroupWhatsappValid(
                            state.methods.getValues('whatsappIdBilling'),
                            'billing'
                          );
                        }}
                        color="success"
                        variant="outlined"
                        className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                        size="small"
                      >
                        Check
                      </Button>
                    </div>
                  </div>

                  {/* Whatsapp Ticket */}
                  <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">
                        Whatsapp Ticket Auto Respon
                      </span>
                    </div>
                    <Field.Text
                      name="whatsappIdTicket"
                      label="ChatID Group Ticket Internal"
                      size="small"
                      helperText="Whatsapp Node Ticket / PSB"
                    />
                    <div className="tw-flex tw-flex-row tw-items-center tw-justify-end tw-gap-2">
                      <Button
                        onClick={() => {
                          state.testSendWhatsapp(
                            state.methods.getValues('whatsappIdTicket'),
                            'billing'
                          );
                        }}
                        color="success"
                        variant="outlined"
                        className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                        size="small"
                      >
                        Kirim Test
                      </Button>
                      <Button
                        onClick={() => {
                          state.checkGroupWhatsappValid(
                            state.methods.getValues('whatsappIdBilling'),
                            'billing'
                          );
                        }}
                        color="success"
                        variant="outlined"
                        className="tw-flex-none tw-w-min tw-whitespace-nowrap"
                        size="small"
                      >
                        Check
                      </Button>
                    </div>
                  </div>
                  <Divider />

                  {/* Customer Notifications */}
                  <div className=" tw-px-5 tw-py-7 tw-gap-3 tw-flex tw-flex-col tw-ring-1 tw-ring-gray-500 tw-rounded-lg tw-relative">
                    <div className="tw-bg-white tw-px-2 tw-absolute -tw-top-3">
                      <span className="tw-font-semibold tw-text-xs">Notifikasi Pelanggan</span>
                    </div>
                    <Stack spacing={4}>
                      <Field.Text
                        select
                        name="templateAutoSendBilling"
                        label="Template Konfirmasi Pembayaran ke Pelanggan"
                        size="small"
                        helperText="Whatsapp Node Billing"
                      >
                        {templates.map((t, i) => (
                          <MenuItem key={i} value={t._id}>
                            {t.title}
                          </MenuItem>
                        ))}
                      </Field.Text>
                      <Field.Text
                        select
                        name="notificationPaymentAfterPsb"
                        label="Template Notifikasi Setelah PSB"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{ displayEmpty: true }}
                        helperText="Whatsapp Node Customer Service"
                      >
                        {templates.map((t, i) => (
                          <MenuItem key={i} value={t._id}>
                            {t.title}
                          </MenuItem>
                        ))}
                        <MenuItem value={null}>Tanpa Template</MenuItem>
                      </Field.Text>
                    </Stack>
                  </div>
                  <Divider />
                </Stack>
              </TabPanel>

              {/* Tab 3: Pengaturan Invoice */}
              <TabPanel value="3">
                <Stack className="tw-py-2" spacing={2}>
                  {state.placeholder != null ? (
                    <div className="tw-relative tw-mx-auto">
                      <div className="-tw-top-5 tw-right-0 tw-absolute">
                        <IconButton
                          color="error"
                          type="button"
                          onClick={() => state.clearPlaceholder()}
                        >
                          <Iconify icon="mdi:close" />
                        </IconButton>
                      </div>

                      <img
                        className="tw-w-36 tw-aspect-square tw-rounded-full tw-object-cover tw-object-center"
                        src={`/public/uploads/${state.placeholder.replaceAll('/public/uploads', '')}`}
                        alt="Logo"
                      />
                    </div>
                  ) : (
                    <Field.UploadAvatar name="companyLogo" />
                  )}
                  <span className="tw-text-xs tw-text-gray-500 tw-mx-auto">
                    Default: Logo Intek
                  </span>
                  <Field.Text
                    name="companyName"
                    fullWidth
                    label="Nama Perusahaan"
                    size="small"
                    helperText="default: PT. INFORMASI NUSANTARA TEKNOLOGI"
                  />
                  <Field.Text
                    name="companyAddress"
                    fullWidth
                    label="Alamat Perusahaan"
                    size="small"
                    helperText="default: Ruko King Business Center, Blok A5 No. 11, Batam"
                  />
                </Stack>
              </TabPanel>
            </TabContext>
          </DialogContent>
          <DialogActions>
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-gap-2">
              <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                <Button onClick={state.onTestPingArea} color="success" variant="outlined">
                  Test
                </Button>
                <Button onClick={state.writeFirewallRules} color="primary" variant="outlined">
                  <Iconify icon="mdi:plus" /> Firewall Rules
                </Button>
              </div>
              <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                <Button onClick={state.closeDialog} color="error">
                  Tutup
                </Button>
                {state.selectedTab !== '0' && (
                  <Button
                    onClick={() =>
                      state.setSelectedTab((parseInt(state.selectedTab) - 1).toString())
                    }
                  >
                    Prev
                  </Button>
                )}
                {state.selectedTab !== '3' && (
                  <Button
                    onClick={() =>
                      state.setSelectedTab((parseInt(state.selectedTab) + 1).toString())
                    }
                  >
                    Next
                  </Button>
                )}
                <Button color="primary" onClick={state.submit} variant="contained">
                  Simpan
                </Button>
              </div>
            </div>
          </DialogActions>
        </Dialog>
      </Form>
      <MapsPickerDialog
        show={state.showMaps.value}
        onPick={state.onPickMaps}
        onClose={() => state.showMaps.onFalse()}
      />
    </>
  );
});

const mapStateToProps = (state) => ({ templates: state.broadcastStore.data });

export default connect(mapStateToProps, null, null, { forwardRef: true })(ServerFormDialogNext);
