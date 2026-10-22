/**
 * @typedef {import("src/repositories/area").Area} Area
 * @typedef {import("src/repositories/area").Customer} Customer
 * @typedef {import("src/repositories/subscription").Billing} Billing
 * @typedef {import('src/stores/paymentMethodStore').PaymentMethodStore} PaymentMethodStore
 * @typedef {import('src/repositories/depositMethod').PaymentMethod} DepositMethod
 * @typedef {import('src/repositories/package').ResultPackageList} PackageData
 * @typedef {import('src/repositories/area').Odp} Odp
 * @typedef {'cash' | 'transfer' | 'ewallet'} PaymentMethodKey
 */

import { toast } from 'sonner';
import { BILL_URL } from '@commons/constant';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useMemo, useState } from 'react';
import { usePrivilege } from '@auth/hooks/privileges';

import 'src/extension/date';
import 'src/extension/string';
import 'src/extension/number';
import { usePaymentMethodStore } from 'src/stores/paymentMethodStore';
import {
  areaRepository,
  customerRepository,
  invoiceTempRepository,
  packagePlanRepository,
  subscriptionRepository,
} from 'src/repositories';

export function usePaymentForm() {
  const confirm = useConfirm();
  /** @type {PaymentMethodStore} */
  const paymentMethodStore = usePaymentMethodStore();

  const paymentMethodList = [
    {
      label: 'Cash',
      value: 'cash',
    },
    {
      label: 'Transfer',
      value: 'transfer',
    },
    {
      label: 'E-Wallet',
      value: 'ewallet',
    },
  ];

  /** @type {[PaymentMethodKey, (v: PaymentMethodKey) => void]} */
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedDepositMethod, setSelectedDepositMethod] = useState(null);
  const partiallyPaidFormRef = useRef();

  /** @type {DepositMethod[]} */
  const availableDepositMethod = useMemo(() => {
    /** @type {DepositMethod[]} */
    let items = [];
    if (paymentMethod === 'cash') items = paymentMethodStore.cash;
    if (paymentMethod === 'transfer') items = paymentMethodStore.transfer;
    if (paymentMethod === 'ewallet') items = paymentMethodStore.ewallet;
    return items.filter((m) => m.status === 'active');
  });

  /** @type {[Area, Function]} */
  const [area, setArea] = useState(null);

  /** @type {[Odp, Function]} */
  const [odp, setOdp] = useState(null);

  /** @type {[Customer, Function]} */
  const [customer, setCustomer] = useState(null);

  /** @type {[PackageData, Function]} */
  const [packageData, setPackageData] = useState(null);

  const [paymentDate, setPaymentDate] = useState(new Date());

  /** @type {Billing[], Function} */
  const [billingList, setBillingList] = useState([]);

  const checkedAll = useMemo(
    () => billingList.filter((b) => b.status !== 'canceled').every((b) => b.checked),
    [billingList]
  );

  const [note, setNote] = useState('');

  /** @type {File[], Function} */
  const [evidences, setEvidences] = useState([]);

  /** @type {string[], Function} */
  const [previewEvidences, setPreviewEvidences] = useState([]);
  const { isAdmin } = usePrivilege();

  const allowAction = isAdmin;

  const loading = useBoolean(false);
  const loadingSubmit = useBoolean(false);

  const itemHeader = useMemo(() => [
    {
      label: 'ID',
      value: customer?.customerId ?? '-',
    },
    {
      label: 'Pelanggan',
      value: customer?.fullname ?? '-',
    },
    {
      label: 'Nomor Telepon',
      value: customer?.phone ?? '-',
    },
    {
      label: 'Alamat',
      value: customer?.address ?? '-',
    },
    {
      label: 'Tanggal Registrasi',
      value: customer?.activePackage?.start?.toDate().format('dd MMM yyyy') ?? '-',
    },
    {
      label: 'Area / POP',
      value: area?.title ?? '-',
    },
    {
      label: 'ODP',
      value: odp?.name ?? '-',
    },
    {
      label: 'Paket Saat ini',
      value: packageData?.title ?? '-',
    },
    {
      label: 'Biaya Bulanan',
      value: customer?.activePackage?.price?.toString().toNumber().formatCurrency() ?? '-',
    },
    {
      label: 'Jenis Layanan',
      value: area?.isPrePaid ? 'Pra-Bayar / Bayar didepan' : 'Pasca-Bayar / Bayar dibelakang',
    },
    {
      label: 'Tanggal Jatuh Tempo',
      value: area?.duoDate ?? '-',
    },
  ]);

  const selectedTotalItem = useMemo(
    () => billingList.filter((b) => b.checked).length,
    [billingList]
  );

  const selectedTotalAmount = useMemo(
    () => billingList.filter((b) => b.checked).reduce((acc, b) => acc + b.amount, 0),
    [billingList]
  );

  function toggleCheckedAll() {
    if (checkedAll) {
      setBillingList((prev) => prev.map((b) => ({ ...b, checked: false })));
    } else {
      setBillingList((prev) =>
        prev.map((b) => (b.status === 'canceled' ? b : { ...b, checked: true }))
      );
    }
  }

  function reset() {
    setCustomer(null);
    setOdp(null);
    setArea(null);
    setPaymentDate(new Date());
    setBillingList([]);
    setNote('');
    setEvidences([]);
    setPreviewEvidences([]);
  }

  /** Billing Action */
  function validateSubmit() {
    if (evidences.length <= 0 && area?.additional?.billingRequireProofOfPayment)
      throw new Error('Bukti Pembayaran wajib diisi');

    const depositMethodInList = availableDepositMethod.find((m) => m._id === selectedDepositMethod);
    if (!depositMethodInList) throw new Error('Metode Deposit tidak valid');
  }

  async function refreshBillingList() {
    loading.onTrue();
    try {
      const snapshotBilling = await subscriptionRepository.getBillingList(customer._id);

      const billing = snapshotBilling.billings.map((b) => {
        b.checked = b.status !== 'canceled';
        b.editable = false;
        return b;
      });

      setBillingList(billing);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function toggleCheckedBilling(item) {
    setBillingList((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, checked: !i.checked } : i))
    );
  }

  function openInvoice(item) {
    const url = `${BILL_URL}/invoice/${item._id}`;
    window.open(url, '_blank');
  }

  async function submitPartiallyPayment() {
    try {
      validateSubmit();

      const billingDataList = billingList.filter((b) => b.checked);
      const total = billingDataList.reduce((acc, b) => acc + b.amount, 0);
      const result = await partiallyPaidFormRef.current.open(billingDataList);
      if (!result) return;

      const date = paymentDate.format('yyyy-MM-dd');
      const time = paymentDate.format('HH:mm');
      /** @type {import('src/repositories/subscription').SubmitPaymentRequest} */
      const request = {
        amount: total,
        billingList: result.map((r) => r.billing),
        amountList: result.map((r) => r.amount),
        customer: customer._id,
        date,
        time,
        depositMethod: selectedDepositMethod,
        paymentEvidence: evidences,
        paymentMethod,
        duoDateCharge: 0,
        note,
      };

      let promises;

      if (isAdmin) {
        promises = subscriptionRepository.submitPayment(request);
      } else {
        promises = invoiceTempRepository.submit(request);
      }

      loadingSubmit.onTrue();
      toast.promise(promises, {
        loading: 'Memproses',
        success: () => {
          refreshBillingList();
          return 'Berhasil bayar partially';
        },
        error: (err) => err?.message ?? 'Gagal Melakukan bayar partially',
        finally: () => {
          loadingSubmit.onFalse();
        },
      });
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function submitPayment() {
    try {
      validateSubmit();

      const billing = billingList.filter((b) => b.checked).map((b) => b._id);
      const total = billingList
        .filter((b) => b.checked)
        .reduce((prev, current) => prev + current.amount, 0);

      console.log({ billing, total });

      const date = paymentDate.format('yyyy-MM-dd');
      const time = paymentDate.format('HH:mm');
      /** @type {import('src/repositories/subscription').SubmitPaymentRequest} */
      const request = {
        amount: total,
        billingList: billing,
        customer: customer._id,
        date,
        time,
        depositMethod: selectedDepositMethod,
        paymentEvidence: evidences,
        paymentMethod,
        duoDateCharge: 0,
        note,
      };

      let promises;
      if (isAdmin) {
        promises = subscriptionRepository.submitPayment(request);
      } else {
        promises = invoiceTempRepository.submit(request);
      }

      loadingSubmit.onTrue();
      toast.promise(promises, {
        loading: 'Memproses Pembayaran',
        error: (err) => err?.message ?? 'Gagal Melakukan Pembayaran',
        success: () => {
          refreshBillingList();
          return 'Berhasil mengirim pembayaran';
        },
        finally: () => loadingSubmit.onFalse(),
      });
      // toast.success('Berhasil mengirim pembayaran');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loadingSubmit.onFalse();
    }
  }

  /**
   * @param {{year: number; month: number}[]} items
   */
  async function generateBilling(items) {
    try {
      loading.onTrue();

      const promises = Promise.all(
        items.map(({ month, year }) =>
          subscriptionRepository.generateCustomerBilling({
            customer: customer._id,
            month,
            year,
          })
        )
      );

      toast.promise(promises, {
        loading: 'Generate Billing...',
        error: (err) => err?.message ?? 'Gagal Generate Billing',
        success: () => {
          refreshBillingList();
          return 'Berhasil Generate Billing';
        },
        finally: () => {
          loading.onFalse();
        },
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function cancelBilling(item, reason) {
    try {
      const date = new Date(item.year, item.month - 1).format('MMMM yyyy');
      // await confirm({
      //   title: 'Batalkan Billing',
      //   content: `Apakah anda yakin ingin membatalkan biling pada bulan ${date}`,
      //   confirmationText: 'Batalkan',
      //   confirmationButtonProps: { color: 'primary' },
      //   cancellationText: 'Tidak',
      // });

      loading.onTrue();
      const promises = subscriptionRepository.cancelBilling(item._id, reason);

      toast.promise(promises, {
        loading: 'Membatalkan Billing...',
        error: (err) => err?.message ?? 'Gagal Membatalkan Billing',
        success: () => {
          refreshBillingList();
          return 'Berhasil Membatalkan Billing';
        },
        finally: () => {
          loading.onFalse();
        },
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function restoreBilling(item, reason) {
    try {
      const date = new Date(item.year, item.month - 1).format('MMMM yyyy');
      // await confirm({
      //   title: 'Pulihkan Billing',
      //   content: `Apakah anda yakin ingin memulihkan biling pada bulan ${date}`,
      //   confirmationText: 'Pulihkan',
      //   confirmationButtonProps: { color: 'primary' },
      //   cancellationText: 'Tidak',
      // });

      loading.onTrue();
      const promises = subscriptionRepository.restoreBilling(item._id, reason);

      toast.promise(promises, {
        loading: 'Memulihkan Billing...',
        error: (err) => err?.message ?? 'Gagal Memulihkan Billing',
        success: () => {
          refreshBillingList();
          return 'Berhasil Memulihkan Billing';
        },
        finally: () => {
          loading.onFalse();
        },
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function removeBilling(item, reason) {
    loading.onTrue();
    const promises = subscriptionRepository.removeBilling({ billings: [item._id], reason });

    toast.promise(promises, {
      loading: 'Menghapus Billing...',
      error: (err) => err?.message ?? 'Gagal Menghapus Billing',
      success: () => {
        refreshBillingList();
        return 'Berhasil Menghapus Billing';
      },
      finally: () => {
        loading.onFalse();
      },
    });
  }
  /** End Billing Action */

  /** Action Evidences */
  function addEvidence(file) {
    console.log(file);
    setEvidences((prev) => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewEvidences((prev) => [...prev, e.target.result]);
    };
    reader.readAsDataURL(file);
  }

  function removeEvidence(index) {
    setEvidences((prev) => prev.filter((_, i) => i !== index));
    setPreviewEvidences((prev) => prev.filter((_, i) => i !== index));
  }

  async function load(customer_id) {
    loading.onTrue();
    try {
      await paymentMethodStore.loadPaymentMethods();
      const snapshotCustomer = await customerRepository.getCustomer(customer_id);
      const snapshotArea = await areaRepository
        .getAreaDetail(snapshotCustomer.area)
        .catch(() => null);
      const snapshotOdp = await areaRepository.getODPData(snapshotCustomer.ODP).catch(() => null);
      const snapshotPackage = await packagePlanRepository
        .getSomePackage(snapshotCustomer.activePackage.package)
        .catch(() => null);

      const snapshotBilling = await subscriptionRepository.getBillingList(customer_id);

      const billing = snapshotBilling.billings.map((b) => {
        b.checked = b.status !== 'canceled';
        b.editable = false;
        return b;
      });

      setCustomer(snapshotCustomer);
      setArea(snapshotArea);
      setOdp(snapshotOdp);
      setPackageData(snapshotPackage);
      setBillingList(billing);
    } catch (error) {
      toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  return {
    paymentMethodList,
    paymentMethod,
    setPaymentMethod,
    selectedDepositMethod,
    setSelectedDepositMethod,
    availableDepositMethod,
    paymentDate,
    setPaymentDate,
    billingList,
    note,
    setNote,
    totalItem: selectedTotalItem,
    totalAmount: selectedTotalAmount,
    allowAction,
    loading,
    loadingSubmit,
    itemHeader,
    reset,
    checkedAll,
    onCheckAll: toggleCheckedAll,
    billingAction: {
      refresh: refreshBillingList,
      toggle: toggleCheckedBilling,
      open: openInvoice,
      generate: generateBilling,
      cancel: cancelBilling,
      restore: restoreBilling,
      submitPartiallyPayment,
      submitPayment,
      remove: removeBilling,
    },
    evidences: {
      add: addEvidence,
      remove: removeEvidence,
      previews: previewEvidences,
    },
    load,
    // Ref
    partiallyPaidFormRef,
  };
}
