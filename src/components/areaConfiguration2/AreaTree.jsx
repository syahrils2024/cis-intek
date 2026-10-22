/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { InlineIcon } from '@iconify/react';
import { Iconify } from '@components/iconify';
import { useBoolean } from '@hooks/use-boolean';

import { Collapse } from '@mui/material';

import { areaRepository } from 'src/repositories';
import { setOdpStore } from 'src/stores/odpStore';
import { setNestedAreaStore } from 'src/stores/areaConfiguration';

import { NetIndicatorAreaTree } from './NetIndicatorAreaTree';
/**
 * @typedef {import('src/repositories/area').AreaCategory} AreaCategory
 * @typedef {import('./AreaPicker').CallbackContext} CallbackContext
 */

/**
 * @param {{
 * selectedAreaId: string;
 * selectedDeviceId: string;
 * areaCategory: AreaCategory;
 * icon: React.JSX;
 * parentId: string | null
 * parent: AreaCategory;
 * index0: number | undefined;
 * index1: number | undefined;
 * index2: number | undefined;
 * index3: number | undefined;
 * index4: number | undefined;
 * index5: number | undefined;
 * key0: string;
 * key1: string;
 * key2: string;
 * key3: string;
 * key4: string;
 * key5: string;
 * onContext: CallbackContext
 * onPickarea: CallbackContext
 * }} props
 */

export default function AreaTree({
  areaCategory,
  parentId,
  icon,
  index0,
  index1,
  index2,
  index3,
  index4,
  index5,
  key0,
  key1,
  key2,
  key3,
  key4,
  key5,
  selectedAreaId,
  selectedDeviceId,
  onContext,
  onPickarea,
}) {
  const dispatch = useDispatch();
  const expand = useBoolean(
    [
      ...(areaCategory.areaCategoryChildren ?? []),
      ...(areaCategory.odcChildren ?? []),
      ...(areaCategory.odpChildren ?? []),
      ...(areaCategory.ponChildren ?? []),
    ].length >= 1
  );

  /** @param {string} areaId */
  const prefetch = async (areaId) => {
    expand.onToggle();
    onPickarea({
      index0,
      index1,
      index2,
      index3,
      index4,
      index5,
      item: areaCategory,
      key0,
      key1,
      key2,
      key3,
      key4,
      key5,
    });
    if (!areaId) return;

    try {
      const snapshotArea = await areaRepository.getAreaById(areaId);
      let snapshotOdp2 = [];
      if (parentId) {
        snapshotOdp2 = await areaRepository.getOdpListLevel2(parentId, areaId);
      }
      const snapshotOther = await areaRepository.getOdpList(areaId);

      const odp = [...snapshotOther, ...snapshotOdp2].filter((o) =>
        o.name.toLowerCase().includes('odp')
      );

      const odc = [...snapshotOther, ...snapshotOdp2].filter((o) =>
        o.name.toLowerCase().includes('odc')
      );

      const pon = [...snapshotOther, ...snapshotOdp2].filter((o) =>
        o.name.toLowerCase().includes('pon')
      );

      const categoryArea = snapshotArea;

      dispatch(setOdpStore({ key: 'odps', value: odp }));
      dispatch(
        setNestedAreaStore({
          index0,
          index1,
          index2,
          index3,
          index4,
          index5,
          key0,
          key1,
          key2,
          key3,
          key4,
          key5,
          // odc: odc ?? [],
          // odp: [],
          // pon: pon ?? [],
          category: categoryArea ?? [],
        })
      );
    } catch (err) {
      console.error(err);
      if (err instanceof Error) toast.error(err.message);
    }
  };

  /**
   *
   * @param {Event} e
   */
  const onPressContext = (e) => {
    e.preventDefault();
    onContext(e, {
      index0,
      index1,
      index2,
      index3,
      index4,
      index5,
      item: areaCategory,
      key1,
      key2,
      key3,
      key4,
      key5,
      parentId,
    });
  };

  const isSelectedArea = (areaCategory?.id ?? areaCategory?._id) === selectedAreaId;
  const isSelectedDevice = (areaCategory.id ?? areaCategory._id) === selectedDeviceId;

  return (
    <div className="tw-flex tw-flex-col tw-relative">
      <div
        onClick={() => prefetch(areaCategory?.id ?? areaCategory._id)}
        onContextMenu={onPressContext}
        className={`tw-flex tw-flex-col tw-pl-[0.8rem] tw-py-3 tw-pr-3 tw-rounded-lg tw-relative hover:tw-bg-primary/10 ${isSelectedArea && 'tw-bg-primary/10'}`}
      >
        {/* Line */}
        {typeof index1 === 'number' && (
          <div className="tw-h-full tw-absolute -tw-left-1 tw-inset-y-0 tw-bg-gray-200 tw-w-[1.5px]" />
        )}

        {typeof index2 === 'number' && (
          <div className="tw-h-full tw-absolute -tw-left-7 tw-inset-y-0 tw-bg-gray-200 tw-w-[1.5px]" />
        )}

        {typeof index3 === 'number' && (
          <div className="tw-h-full tw-absolute -tw-left-[3.25rem] tw-inset-y-0 tw-bg-gray-200 tw-w-[1.5px]" />
        )}

        {typeof index4 === 'number' && (
          <div className="tw-h-full tw-absolute -tw-left-[4.72rem] tw-inset-y-0 tw-bg-gray-200 tw-w-[1.5px]" />
        )}

        {typeof index5 === 'number' && (
          <div className="tw-h-full tw-absolute -tw-left-[6.25rem] tw-inset-y-0 tw-bg-gray-200 tw-w-[1.5px]" />
        )}

        {/* End Line */}
        <div className="tw-flex tw-flex-row tw-items-center tw-gap-2 tw-relative">
          {/* Line */}
          {typeof index1 === 'number' && (
            <div className="tw-w-4 tw-absolute -tw-left-4 tw-top-1/2 tw-inset-y-0 tw-bg-gray-200 tw-h-[1.5px]" />
          )}

          {/* End Line */}
          <div
            className={` ${isSelectedArea ? 'tw-text-primary' : isSelectedDevice ? 'tw-text-black' : ''}`}
          >
            {icon}
          </div>
          <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-justify-between">
            <span
              className={`tw-text-xs tw-font-medium ${isSelectedArea ? 'tw-text-primary' : isSelectedDevice ? 'tw-text-black' : ' tw-text-gray-500'} ${areaCategory.type === 'area' && areaCategory.active === false ? 'tw-text-red-500' : ''}`}
            >
              {areaCategory?.title ?? areaCategory?.name ?? '-'}
            </span>
            <div className="tw-flex tw-flex-row tw-items-center">
              {areaCategory?.netStatus ? (
                <NetIndicatorAreaTree
                  status={areaCategory.netStatus.status}
                  timestamp={areaCategory.netStatus.lastChecked}
                />
              ) : null}
              <Iconify
                icon="material-symbols:arrow-right"
                fontSize={24}
                className={`tw-duration-300 ${expand.value ? 'tw-rotate-90' : 'tw-rotate-0'} ${isSelectedArea ? 'tw-text-primary' : isSelectedDevice ? 'tw-text-black' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="tw-flex tw-flex-col tw-pl-3 tw-rounded-lg tw-relative">
        <Collapse in={expand.value}>
          <div className="tw-flex tw-flex-col tw-pl-3 tw-rounded-lg tw-relative">
            {/* Kab Kecamatan */}
            {areaCategory.areaCategoryChildren?.map((areaCategoryChildren, i) => (
              <AreaTree
                key={i}
                index0={index0}
                parent={areaCategory}
                selectedAreaId={selectedAreaId}
                selectedDeviceId={selectedDeviceId}
                index1={index1 ?? (index0 !== undefined ? i : undefined)}
                index2={index2 ?? (index1 !== undefined ? i : undefined)}
                index3={index3 ?? (index2 !== undefined ? i : undefined)}
                index4={index4 ?? (index3 !== undefined ? i : undefined)}
                index5={index5 ?? (index4 !== undefined ? i : undefined)}
                key0={key0}
                key1={key0 !== undefined ? key1 ?? 'areaCategoryChildren' : undefined}
                key2={key1 !== undefined ? key2 ?? 'areaCategoryChildren' : undefined}
                key3={key2 !== undefined ? key3 ?? 'areaCategoryChildren' : undefined}
                key4={key3 !== undefined ? key4 ?? 'areaCategoryChildren' : undefined}
                key5={key4 !== undefined ? key5 ?? 'areaCategoryChildren' : undefined}
                parentId={areaCategory?.id ?? areaCategory._id}
                areaCategory={areaCategoryChildren}
                onPickarea={onPickarea}
                icon={
                  <InlineIcon
                    className={
                      areaCategoryChildren.type === 'area' && areaCategoryChildren.active === false
                        ? 'tw-text-red-500'
                        : ''
                    }
                    icon={
                      typeof index0 === 'number' && typeof index1 === 'undefined'
                        ? 'fluent:folder-globe-20-regular'
                        : typeof index1 === 'number' && typeof index2 === 'undefined'
                          ? 'gis:search-globe'
                          : areaCategoryChildren.type === 'area'
                            ? 'cbi:mikrotik'
                            : 'fluent:folder-globe-20-regular'
                    }
                    width={18}
                  />
                }
                onContext={onContext}
              />
            ))}
            {/* Pon */}
            {areaCategory.ponChildren?.map((ponChildren, i) => (
              <AreaTree
                key={i}
                parent={areaCategory}
                index0={index0}
                selectedAreaId={selectedAreaId}
                selectedDeviceId={selectedDeviceId}
                index1={index1 ?? (index0 !== undefined ? i : undefined)}
                index2={index2 ?? (index1 !== undefined ? i : undefined)}
                index3={index3 ?? (index2 !== undefined ? i : undefined)}
                index4={index4 ?? (index3 !== undefined ? i : undefined)}
                index5={index5 ?? (index4 !== undefined ? i : undefined)}
                key0={key0}
                key1={key0 !== undefined ? key1 ?? 'ponChildren' : undefined}
                key2={key1 !== undefined ? key2 ?? 'ponChildren' : undefined}
                key3={key2 !== undefined ? key3 ?? 'ponChildren' : undefined}
                key4={key3 !== undefined ? key4 ?? 'ponChildren' : undefined}
                key5={key4 !== undefined ? key5 ?? 'ponChildren' : undefined}
                areaCategory={ponChildren}
                parentId={areaCategory?.id ?? areaCategory._id}
                onPickarea={onPickarea}
                icon={<Iconify icon="fluent:triangle-left-12-regular" />}
                onContext={onContext}
              />
            ))}
            {/* ODC */}
            {areaCategory.odcChildren?.map((odcChildren, i) => (
              <AreaTree
                key={i}
                parent={areaCategory}
                index0={index0}
                selectedAreaId={selectedAreaId}
                selectedDeviceId={selectedDeviceId}
                index1={index1 ?? (index0 !== undefined ? i : undefined)}
                index2={index2 ?? (index1 !== undefined ? i : undefined)}
                index3={index3 ?? (index2 !== undefined ? i : undefined)}
                index4={index4 ?? (index3 !== undefined ? i : undefined)}
                index5={index5 ?? (index4 !== undefined ? i : undefined)}
                key0={key0}
                key1={key0 !== undefined ? key1 ?? 'odcChildren' : undefined}
                key2={key1 !== undefined ? key2 ?? 'odcChildren' : undefined}
                key3={key2 !== undefined ? key3 ?? 'odcChildren' : undefined}
                key4={key3 !== undefined ? key4 ?? 'odcChildren' : undefined}
                key5={key4 !== undefined ? key5 ?? 'odcChildren' : undefined}
                areaCategory={odcChildren}
                parentId={areaCategory?.id ?? areaCategory._id}
                onPickarea={onPickarea}
                icon={<Iconify icon="mdi:square-outline" />}
                onContext={onContext}
              />
            ))}
            {/* ODP */}
            {areaCategory.odpChildren?.map((odpChildren, i) => (
              <AreaTree
                key={i}
                index0={index0}
                parent={areaCategory}
                selectedAreaId={selectedAreaId}
                selectedDeviceId={selectedDeviceId}
                index1={index1 ?? (index0 !== undefined ? i : undefined)}
                index2={index2 ?? (index1 !== undefined ? i : undefined)}
                index3={index3 ?? (index2 !== undefined ? i : undefined)}
                index4={index4 ?? (index3 !== undefined ? i : undefined)}
                index5={index5 ?? (index4 !== undefined ? i : undefined)}
                key0={key0}
                key1={key0 !== undefined ? key1 ?? 'odpChildren' : undefined}
                key2={key1 !== undefined ? key2 ?? 'odpChildren' : undefined}
                key3={key2 !== undefined ? key3 ?? 'odpChildren' : undefined}
                key4={key3 !== undefined ? key4 ?? 'odpChildren' : undefined}
                key5={key4 !== undefined ? key5 ?? 'odpChildren' : undefined}
                areaCategory={odpChildren}
                parentId={areaCategory?.id ?? areaCategory._id}
                onPickarea={onPickarea}
                icon={<Iconify icon="la:dot-circle" style={{ color: '#2b8113' }} />}
                onContext={onContext}
              />
            ))}
          </div>
        </Collapse>
      </div>
    </div>
  );
}
