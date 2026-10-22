/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/**
 * @typedef {import('src/repositories/area').Area} Area
 * @typedef {import('src/repositories/package').ResultPackageList} ResultPackageList
 */

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { connect, useDispatch } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { format, isAfter, setDate, addMonths, differenceInDays } from 'date-fns';

import { DatePicker } from '@mui/x-date-pickers';
import { Divider, MenuItem, TextField } from '@mui/material';

import 'src/extension/string';
import 'src/extension/number';
import { setArea } from 'src/stores/areaStore';
import { setPackage } from 'src/stores/packageStore';
import { areaRepository, packagePlanRepository } from 'src/repositories';

/**
 * @param {{areaList: Area[]; packageList: ResultPackageList[]}} param0
 * @returns
 */
function SimulationBilling({ areaList, packageList }) {
  const dispatch = useDispatch();

  /**
   * @type {[string, (areaId: string) => void ]}
   */
  const [selectedAreaId, setSelectedAreaId] = useState(null);

  /**
   * @type {[string, (packageId: string) => void]}
   */
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  /**
   * @type {[Date, (d: Date) => void]}
   */
  const [selectedDate, setSelectedDate] = useState(new Date());

  const mapAreaList = useMemo(() => {
    const maping = [];
    areaList.forEach((a) => {
      maping.push(a.title);
      a.area.forEach((area) => {
        maping.push(area);
      });
    });

    return maping;
  });

  /**
   * @type {Area}
   */
  const selectedArea = useMemo(() => {
    if (!selectedAreaId) return null;
    return mapAreaList.find((a) => a._id === selectedAreaId);
  });

  const availablePackageList = useMemo(() => {
    if (!selectedArea) return [];
    const resultMap = packageList
      .map((p) => {
        const data = { ...p };
        const findPrice = p.prices.find((price) => price.area === selectedAreaId);
        if (!findPrice) return null;
        if (findPrice.price === 0 && !p.title.toLowerCase().includes('free')) return null;
        data.price = findPrice.price.toString().toNumber().formatCurrency();
        return data;
      })
      .filter((result) => !!result);

    return resultMap;
  });

  const selectedPrice = useMemo(() => {
    if (!selectedPackageId) return null;
    return availablePackageList.find((p) => p._id === selectedPackageId);
  });

  async function prefetch() {
    if (areaList.length <= 0) {
      const snapshotArea = await areaRepository.getAllArea().catch((err) => {
        toast.error(err.message);
        return [];
      });
      dispatch(setArea(snapshotArea));
    }

    if (packageList.length <= 0) {
      const snapshotPackage = await packagePlanRepository.getPackageList().catch((err) => {
        toast.error(err.message);
        return [];
      });

      dispatch(setPackage(snapshotPackage));
    }
  }

  useEffect(() => {
    prefetch();
  }, []);

  /**
   * @typedef {{title: string; bill: number; year: number; month; duoDate: Date; description: string}[]} ResultSimulation
   * @type {ResultSimulation}
   */
  const result = useMemo(() => {
    if (!selectedArea || !selectedPrice) return [];

    const isPrepaid = selectedArea.isPrePaid;
    const duoDate = setDate(selectedDate, selectedArea.duoDate ?? 0);
    const isInstallationAfterDuoDate = isAfter(selectedDate, duoDate);

    /**
     * @type {{title: string; bill: number; year: number; month; duoDate: Date; description: string}[]}
     */
    const bills = [];

    const maxDuoDate = isInstallationAfterDuoDate ? addMonths(duoDate, 1) : duoDate;
    const distanceDays = differenceInDays(selectedDate, maxDuoDate);

    if (typeof selectedArea.installationCharge === 'number') {
      bills.push({
        title: 'Biaya Pemasangan',
        bill: selectedArea.installationCharge,
        duoDate: maxDuoDate,
        description: 'Biaya Pemasangan Awal',
        month: format(selectedDate, 'MMMM'),
        year: format(selectedDate, 'yyyy'),
      });
    }

    const distanceDaysPositive = Math.abs(distanceDays);

    const billPerday = selectedPrice.price.toString().toNumber() / 30;

    const totalStartBill =
      distanceDaysPositive >= 30 ? selectedPrice.price : billPerday * distanceDaysPositive;

    const roundStartBill = Math.ceil(totalStartBill / 1000) * 1000;

    if (isPrepaid) {
      const start = format(selectedDate, 'dd-MM-yyyy');
      const until = format(maxDuoDate, 'dd-MM-yyyy');

      const startBill = selectedDate;

      bills.push({
        title: selectedPrice.title,
        month: format(selectedDate, 'MMMM'),
        year: format(selectedDate, 'yyyy'),
        bill: roundStartBill,
        description: `${start} s/d ${until} (${distanceDaysPositive} hari)`,
        duoDate: selectedDate,
        isolirDate: selectedArea.autoIsolirDate
          ? setDate(selectedDate, selectedArea.autoIsolirDate)
          : null,
      });

      const nLength = new Array(1).fill(0).map((n, i) => i + 1);
      for (const i of nLength) {
        const currentStart = setDate(addMonths(startBill, i), selectedArea.duoDate);
        const currentEnd = addMonths(currentStart, 1);

        const currentStartFormat = format(currentStart, 'dd-MM-yyyy');
        const currentEndFormat = format(currentEnd, 'dd-MM-yyyy');

        bills.push({
          title: selectedPrice.title,
          month: format(currentStart, 'MMMM'),
          year: format(currentStart, 'yyyy'),
          bill: selectedPrice.price.toString().toNumber(),
          description: `${currentStartFormat} s/d ${currentEndFormat} (1 bulan)`,
          duoDate: currentStart,
          isolirDate: selectedArea.autoIsolirDate
            ? setDate(currentStart, selectedArea.autoIsolirDate)
            : null,
        });
      }
    } else {
      const start = format(selectedDate, 'dd-MM-yyyy');
      const until = format(maxDuoDate, 'dd-MM-yyyy');

      const startBill = maxDuoDate;

      bills.push({
        title: selectedPrice.title,
        month: format(maxDuoDate, 'MMMM'),
        year: format(maxDuoDate, 'yyyy'),
        bill: roundStartBill,
        description: `${start} s/d ${until} (${distanceDaysPositive} hari)`,
        duoDate: maxDuoDate,
        isolirDate: selectedArea.autoIsolirDate
          ? setDate(maxDuoDate, selectedArea.autoIsolirDate)
          : null,
      });

      const nLength = new Array(1).fill(0).map((n, i) => i);
      for (const i of nLength) {
        const currentStart = addMonths(startBill, i);
        const currentEnd = addMonths(currentStart, 1);

        const currentStartFormat = format(currentStart, 'dd-MM-yyyy');
        const currentEndFormat = format(currentEnd, 'dd-MM-yyyy');

        bills.push({
          title: selectedPrice.title,
          month: format(currentEnd, 'MMMM'),
          year: format(currentEnd, 'yyyy'),
          bill: selectedPrice.price.toString().toNumber(),
          description: `${currentStartFormat} s/d ${currentEndFormat} (1 bulan)`,
          duoDate: currentEnd,
          isolirDate: selectedArea.autoIsolirDate
            ? setDate(currentEnd, selectedArea.autoIsolirDate)
            : null,
        });
      }
    }

    return bills;
  });

  /** @type {{month: string; year: string; billTotal: number; items: ResultSimulation[]}[]} */
  const groupResult = useMemo(() => {
    const groupList = [...new Set(result.map((d) => `${d.month},${d.year}`))];
    return groupList.map((g) => {
      const [currentMonth, currentYear] = g.split(',');
      const items = result.filter((r) => r.year === currentYear && r.month === currentMonth);
      const billTotal = items.reduce((prev, current) => prev + current.bill, 0);

      return {
        month: currentMonth,
        year: currentYear,
        billTotal,
        items,
      };
    });
  });

  return (
    <div className="tw-w-full tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-px-5 tw-gap-4">
      {/* Form Data */}
      <div className="tw-flex tw-flex-col tw-w-full tw-gap-4">
        <TextField
          select
          value={selectedAreaId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
          label="Area / POP"
          size="small"
          placeholder="Pilih Area / POP"
        >
          {mapAreaList.map((area, i) =>
            typeof area === 'string' ? (
              <MenuItem key={i} disabled>
                {area}
              </MenuItem>
            ) : (
              <MenuItem key={i} value={area._id}>
                <div className="tw-pl-2">{area.title}</div>
              </MenuItem>
            )
          )}
        </TextField>
        <TextField
          value={
            !selectedArea
              ? '-'
              : selectedArea.isPrePaid
                ? 'Prepaid/Prabayar/bayar didepan'
                : 'Postpaid/Pascabayar/bayar dibelakang'
          }
          label="Jenis Pembayaran"
          size="small"
          readOnly
        />
        <TextField
          select
          value={selectedPackageId}
          onChange={(e) => setSelectedPackageId(e.target.value)}
          label="Paket"
          size="small"
        >
          {availablePackageList.map((p, i) => (
            <MenuItem
              key={i}
              value={p._id}
              // onClick={() => methods.setValue('price', p?.price ?? 0)}
            >
              <div className="tw-pl-2">
                {p.title} - {p?.price?.toString().toNumber().formatCurrency()}
              </div>
            </MenuItem>
          ))}
        </TextField>
        <DatePicker
          value={dayjs(selectedDate)}
          label="Rencana Pemasangan"
          slotProps={{ textField: { size: 'small' } }}
          onChange={(e) => {
            setSelectedDate(e.toDate());
          }}
        />
      </div>
      {/* Simulation */}
      <div className="tw-flex tw-flex-col tw-gap-5">
        {groupResult.map((gr, i) => (
          <div
            key={i}
            className="tw-w-full tw-relative tw-flex tw-flex-col tw-p-5 tw-ring-1 tw-ring-gray-400 tw-rounded-lg tw-gap-3"
          >
            <span className="tw-absolute -tw-top-2 tw-px-2 tw-bg-white tw-text-xs">
              {gr.month} - {gr.year}
            </span>
            {gr.items.map((r, j) => (
              <div
                className="tw-ring-1 tw-ring-gray-400 tw-flex tw-flex-col tw-p-3 tw-rounded-lg tw-gap-4 tw-w-full"
                key={j}
              >
                <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-start tw-justify-between tw-gap-4">
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-xs tw-font-semibold">{r.title}</span>
                  </div>
                  <div className="tw-flex tw-flex-col md:tw-text-right">
                    <span className="tw-text-xs tw-font-semibold">
                      Rp. {r.bill.formatCurrency()}
                    </span>
                    <p className="tw-text-gray-500 tw-text-xs">{r.description}</p>
                  </div>
                </div>
                <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center tw-justify-between tw-gap-4">
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-xs tw-font-semibold">Jatuh Tempo</span>
                    <span className="tw-text-xs tw-text-gray-500">
                      {format(r.duoDate, 'dd-MM-yyyy')}
                    </span>
                  </div>
                  {r.isolirDate && (
                    <div className="tw-flex tw-flex-col md:tw-text-right">
                      <span className="tw-text-xs tw-font-semibold">Auto Isolir</span>
                      <span className="tw-text-xs tw-text-gray-500">
                        {format(r.isolirDate, 'dd-MM-yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Divider />
            <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-justify-between">
              <span className="tw-text-xs tw-text-gray-500">Total</span>
              <span className="tw-text-xs tw-font-semibold">
                Rp. {gr.billTotal.toString().toNumber().formatCurrency()}
              </span>
            </div>
          </div>
        ))}
        {/* {result.map((r, i) => (
          <div
            className="tw-ring-1 tw-ring-gray-400 tw-flex tw-flex-col tw-p-3 tw-rounded-lg tw-gap-4 tw-w-full"
            key={i}
          >
            <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center tw-justify-between tw-gap-4">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-font-semibold">{r.title}</span>
                <span className="tw-text-xs tw-text-gray-500">
                  {r.month} {r.year}
                </span>
              </div>
              <div className="tw-flex tw-flex-col md:tw-text-right">
                <span className="tw-text-xs tw-font-semibold">Rp. {r.bill.formatCurrency()}</span>
                <p className="tw-text-gray-500 tw-text-xs">{r.description}</p>
              </div>
            </div>
            <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center tw-justify-between tw-gap-4">
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-font-semibold">Jatuh Tempo</span>
                <span className="tw-text-xs tw-text-gray-500">
                  {format(r.duoDate, 'dd-MM-yyyy')}
                </span>
              </div>
              {r.isolirDate && (
                <div className="tw-flex tw-flex-col md:tw-text-right">
                  <span className="tw-text-xs tw-font-semibold">Auto Isolir</span>
                  <span className="tw-text-xs tw-text-gray-500">
                    {format(r.isolirDate, 'dd-MM-yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))} */}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  const { all } = state.areaStore;
  const { packagePlans } = state.packageStore;

  return { areaList: all, packageList: packagePlans };
};

export default connect(mapStateToProps)(SimulationBilling);
