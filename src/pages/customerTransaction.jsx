import z from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useSearchParams } from 'react-router-dom';
import { Form, Field } from '@components/hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useMemo, Fragment, useState, useEffect } from 'react';
import CustomerTransactionPaymentPlaceholder from '@components/customerTransaction/PaymentPlaceholder';
import AvailableDepositMethodPicker from '@components/customerTransaction/AvailableDepositMethodPicker';

import { LoadingButton } from '@mui/lab';
import { Stack, Button, Divider, TextField } from '@mui/material';

import 'src/extension/number';
import 'src/extension/string';
import { customerTransactionRepository } from 'src/repositories';
import { useCustomerTransaction } from 'src/stores/customerTransaction';

/**
 * @typedef {import('src/stores/customerTransaction').CustomerTransactionStore} CustomerTransactionStore
 * @typedef {import('src/repositories/customerTransaction').ICheckCustomerResponse} ICheckCustomerResponse
 * @typedef {import('src/repositories/subscription').Billing} Billing
 * @typedef {import('src/repositories/depositMethod').PaymentMethod} PaymentMethod
 */

/**
 *
 * @param {{companyLogo: string; companyName: string; companyAddress: string}} param0
 * @returns
 */

function CustomerTransactionHeader({
  companyLogo = '/assets/intek.png',
  companyName = 'PT. INFORMASI NUSANTARA TEKNOLOGI',
  companyAddress = 'Ruko King Business Center, Blok A5 No. 11, Batam',
}) {
  return (
    <div className="tw-flex tw-flex-col tw-gap-1 tw-w-full">
      <img alt="Company Logo" src={companyLogo} className="tw-h-20 tw-mx-auto" />
      <span className="tw-text-center tw-text-xs tw-font-semibold">{companyName}</span>
      <span className="tw-text-center tw-text-xs">{companyAddress}</span>
    </div>
  );
}

/**
 *
 * @param {{data: ICheckCustomerResponse}} param0
 */
function CustomerTransactionCard({ data }) {
  return (
    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-w-full tw-gap-3">
      <div className="tw-flex tw-flex-col">
        <span className="tw-text-xs">Nama</span>
        <span className="tw-text-xs tw-font-semibold">{data?.fullname}</span>
      </div>
      <div className="tw-flex tw-flex-col">
        <span className="tw-text-xs">No. HP</span>
        <span className="tw-text-xs tw-font-semibold">{data?.phone}</span>
      </div>
      <div className="tw-flex tw-flex-col">
        <span className="tw-text-xs">Alamat</span>
        <span className="tw-text-xs tw-font-semibold">{data?.address}</span>
      </div>
      <div className="tw-flex tw-flex-col">
        <span className="tw-text-xs">Status</span>
        <span className="tw-text-xs tw-font-semibold">{data?.status}</span>
      </div>
    </div>
  );
}

/**
 * @param {{billings: Billing[], onPay: (billings: Billing[]) => void}} param0
 */
function BillingSection({ billings, onPay }) {
  /** @type {CustomerTransactionStore} */
  const totalAmount = useMemo(() => billings.reduce((prev, current) => prev + current.amount, 0));

  function beforePay() {
    onPay(billings);
  }

  if (billings?.length <= 0)
    return (
      <div className="tw-ring-primary tw-ring-1 tw-rounded-md tw-p-3 tw-bg-primary/10 tw-flex tw-flex-col tw-items-center tw-justify-center">
        <span className="tw-text-xs tw-font-semibold ">Anda tidak memiliki tagihan</span>
      </div>
    );

  return (
    <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full">
      {billings.map((billing, i) => (
        <div
          key={i}
          className="tw-flex tw-flex-row tw-w-full tw-gap-2 tw-items-center tw-justify-end"
        >
          <div className="tw-flex tw-flex-row tw-gap-2 tw-w-full">
            <Stack>
              <span className="tw-text-xs tw-font-semibold">{billing.services.join(' ')}</span>
              <span className="tw-text-xs">{billing.summaryPeriode}</span>
            </Stack>
          </div>
          <span className="tw-text-xs tw-whitespace-nowrap">
            Rp. {billing.amount?.toString().toNumber().formatCurrency()}
          </span>
        </div>
      ))}
      <Button
        disabled={!totalAmount}
        variant="outlined"
        color="primary"
        size="small"
        className="tw-mt-4"
        onClick={() => beforePay()}
      >
        Bayar Rp. {totalAmount.formatCurrency()}
      </Button>
    </div>
  );
}

export default function CustomerTransaction() {
  const [search, setSearch] = useState('');
  const isLoadingCustomer = useBoolean(false);
  const isLoadingBilling = useBoolean(false);
  const [query, setQuery] = useSearchParams();
  const depositMethodPickerRef = useRef();
  const confirm = useConfirm();

  const methods = useForm({
    defaultValues: {
      evidence: null,
    },
    resolver: zodResolver({
      evidence: z.instanceof(File).nullable().optional(),
    }),
  });

  /** @type {CustomerTransactionStore} */
  const customerTransaction = useCustomerTransaction();

  async function getBillings(customer_id) {
    isLoadingBilling.onTrue();
    try {
      const snapshotBilling = await customerTransactionRepository.getBillingList(customer_id);
      customerTransaction.setBillingList(snapshotBilling);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoadingBilling.onFalse();
    }
  }

  async function getActiveBilling(customer_id) {
    try {
      const snapshotCustomerTransaction =
        await customerTransactionRepository.getActiveTransaction(customer_id);
      customerTransaction.setCustomerTransaction(snapshotCustomerTransaction);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function searchCustomer(s) {
    isLoadingCustomer.onTrue();
    try {
      const snapshotCustomer = await customerTransactionRepository.checkCustomer(s ?? search);
      customerTransaction.setCustomerData(snapshotCustomer);
      getActiveBilling(snapshotCustomer._id);
      getBillings(snapshotCustomer._id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      isLoadingCustomer.onFalse();
    }
  }

  /**
   * @param {Billing[]} billings
   */
  async function createPayment(billings) {
    try {
      const billingId = billings.map((b) => b._id);
      /** @type {{data: PaymentMethod; category: string}} */
      const depositMethod = await depositMethodPickerRef.current.open();
      if (!depositMethod) return;

      const snapshotCustomerTransaction = await customerTransactionRepository.createTransaction({
        customer_id: customerTransaction.customerData._id,
        billings: billingId,
        depositMethodId: depositMethod.data._id,
        category: depositMethod.category,
      });

      customerTransaction.setCustomerTransaction(snapshotCustomerTransaction);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function uploadEvidence() {
    try {
      const file = methods.getValues('evidence');
      if (!file) throw new Error('Mohon memilih foto bukti pembayaran');
      toast.info('Mohon menunggu');
      const snapshot = await customerTransactionRepository.uploadEvidences({
        _id: customerTransaction.customerTransaction._id,
        files: [file],
      });
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function cancelTransaction() {
    try {
      await confirm({
        title: 'Batalkan',
        description: 'Apakah anda ingin membatalkan pembayaran anda saat ini ?',
        confirmationText: 'Ya',
        cancellationText: 'Tidak',
        confirmationButtonProps: { color: 'error' },
        cancellationButtonProps: { color: 'primary' },
      });
      toast.info('Membatalkan pembayaran');
      await customerTransactionRepository.cancelTransaction({
        customer_id: customerTransaction.customerData._id,
        transactionId: customerTransaction.customerTransaction._id,
      });
      toast.success('Pembayaran berhasil dibatalkan');
      customerTransaction.reset();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  function prefetch() {
    const q = query.get('q');
    if (!!q) {
      setSearch(q);
      searchCustomer(q);
    }
  }

  useEffect(() => {
    prefetch();
  }, []);

  return (
    <Form methods={methods} onSubmit={() => searchCustomer()}>
      <div className="tw-w-full tw-min-h-[100svh] tw-bg-slate-200 tw-flex tw-items-center tw-justify-center tw-p-5">
        <div className="tw-m-5 tw-p-5 tw-rounded-lg tw-gap-2 tw-flex tw-flex-col tw-bg-white tw-ring-1 tw-ring-gray-300 tw-mx-auto tw-w-full tw-max-w-md">
          <CustomerTransactionHeader
            companyName={customerTransaction.customerData?.companyName}
            companyAddress={customerTransaction.customerData?.companyAddress}
            companyLogo={
              !!customerTransaction.customerData?.companyLogo?.trim()
                ? `/public/uploads/${customerTransaction.customerData.companyLogo.replaceAll('/public/uploads', '')}`
                : undefined
            }
          />
          <Divider />
          {customerTransaction.customerTransaction ? (
            <div className="tw-flex tw-flex-col">
              <CustomerTransactionPaymentPlaceholder
                customerTransaction={customerTransaction.customerTransaction}
              />
              {/* Action */}
              {customerTransaction.customerTransaction.status !== 'verify' && (
                <div className="tw-flex tw-flex-col tw-mt-4 tw-w-full">
                  <Field.UploadAvatar name="evidence" />
                  <span className="tw-text-xs tw-mx-auto">Pilih foto bukti pembayaran</span>
                  <div className="tw-w-full tw-grid tw-grid-cols-2 tw-mt-4">
                    <Button
                      color="error"
                      variant="text"
                      fullWidth
                      size="small"
                      onClick={() => cancelTransaction()}
                    >
                      Batalkan
                    </Button>
                    <Button
                      color="success"
                      variant="text"
                      fullWidth
                      size="small"
                      onClick={() => uploadEvidence()}
                    >
                      Upload Bukti
                    </Button>
                  </div>
                </div>
              )}
              <Button
                size="small"
                className="tw-mt-4"
                onClick={() => {
                  customerTransaction.reset();
                }}
              >
                Kembali
              </Button>
            </div>
          ) : customerTransaction.customerData ? (
            <div className="tw-flex tw-flex-col tw-gap-4 tw-w-full">
              <CustomerTransactionCard data={customerTransaction.customerData} />
              <Divider />
              <BillingSection
                billings={customerTransaction.billingList ?? []}
                onPay={(billings) => createPayment(billings)}
              />
              <Button
                size="small"
                className="tw-mt-4"
                onClick={() => {
                  customerTransaction.reset();
                }}
              >
                Kembali
              </Button>
            </div>
          ) : (
            <>
              {/* Input Customer ID */}
              <div className="tw-flex tw-flex-col tw-w-full tw-gap-4 tw-mt-4">
                <TextField
                  size="small"
                  label="ID Pelanggan / No HP"
                  color="primary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <LoadingButton
                  disabled={search.trim() === ''}
                  loading={isLoadingCustomer.value}
                  color="primary"
                  variant="outlined"
                  onClick={() => searchCustomer()}
                >
                  Cek Pelanggan & Tagihan
                </LoadingButton>
              </div>

              {/* End Input CustomerID */}
            </>
          )}
        </div>
        <AvailableDepositMethodPicker ref={depositMethodPickerRef} />
      </div>
    </Form>
  );
}
