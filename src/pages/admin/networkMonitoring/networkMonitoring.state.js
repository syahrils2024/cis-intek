/**
 * @typedef {import("src/repositories/networkMonitoring").NetworkMonitoringDevice} NetworkMonitoringDevice
 * @typedef {import('src/repositories/networkMonitoring').NetworkMonitoringDevicePingRecords} NetworkMonitoringDevicePingRecords
 */

import { toast } from 'sonner';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useMemo, useState, useEffect } from 'react';

import { useMeStore } from 'src/stores/meStore';
import { userProfileRepository } from 'src/repositories';
import {
  getGroups,
  getDevices,
  deleteGroup,
  deleteDevice,
} from 'src/repositories/networkMonitoring';

import {
  buildNetworkMonitoringTree,
  getNetworkMonitoringDescendantIds,
  getNetworkMonitoringCategoryLabel,
} from './networkMonitoringHelper';

/**
 * @typedef {Object} NetworkMonitoringTreeNode
 * @property {string} name
 * @property {string} id
 * @property {string} ip_address
 * @property {string} last_status
 * @property {number|null} last_response_time_ms
 * @property {string|null} last_pinged_at
 * @property {string} [description]
 * @property {string} [category]
 * @property {string} [icon]
 * @property {NetworkMonitoringTreeNode[]} children
 * @property {boolean} [hasMoreChildren]
 */

export function useNetworkMonitoringState() {
  const formRef = useRef();
  const groupFormRef = useRef();
  const slaRef = useRef();

  /** @type {[NetworkMonitoringDevice[], Function]} */
  const [devices, setDevices] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const loading = useBoolean(false);
  const fullscreen = useBoolean(false);
  const containerRef = useRef(null);
  const [treeViewKey, setTreeViewKey] = useState(0);
  /** @type {[string[], Function]} */
  const [expandedNodeIds, setExpandedNodeIds] = useState([]);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);
  const confirm = useConfirm();
  const loadDevicesTimer = useRef(null);
  const [maxDepth, setMaxDepth] = useState(10);

  const treeData = useMemo(
    () =>
      buildNetworkMonitoringTree(devices, { maxDepth, expandedNodeIds: new Set(expandedNodeIds) }),
    [devices, expandedNodeIds, maxDepth]
  );

  async function loadDevices() {
    loading.onTrue();
    setDevices([]);
    setMaxDepth(10);
    try {
      const data = await getDevices({ group: selectedGroupId || undefined });
      if (data.length >= 100) {
        setMaxDepth(3);
      }
      setDevices(data);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  function debouncedLoadDevices(delay = 300) {
    clearTimeout(loadDevicesTimer.current);
    loading.onTrue();
    loadDevicesTimer.current = setTimeout(() => {
      loadDevices();
    }, delay);
  }

  async function loadGroups() {
    try {
      const data = await getGroups();
      setGroups(data);
      if (data.length > 0 && !selectedGroupId) {
        const lastSelected = localStorage.getItem('networkMonitoring_selectedGroupId');
        const isValid = lastSelected && data.some((g) => g.id === lastSelected);
        setSelectedGroupId(isValid ? lastSelected : data[0].id);
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  /**
   * Opens the form dialog with the given options.
   * @param {NetworkMonitoringDevice} [item]
   * @returns {Promise<boolean>} - Resolves to true if the form was submitted successfully, false if it was cancelled.
   */
  async function openFormDialog(item) {
    if (!formRef.current) return false;
    try {
      const currentItem = devices.find((device) => device.id === item?.id);
      const children = currentItem
        ? devices.filter((device) => device.parent_id === currentItem.id)
        : [];
      const result = await formRef.current.open({
        device: currentItem,
        children,
        availableSelectParent: item?.id !== 'root',
        groupId: selectedGroupId,
      });
      if (result) await loadDevices();
      return result;
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      return false;
    }
  }

  /**
   * Opens the group form dialog for create or edit.
   * @param {import("src/repositories/networkMonitoring").NetworkMonitoringGroup} [group]
   * @returns {Promise<boolean>}
   */
  async function openGroupFormDialog(group) {
    if (!groupFormRef.current) return false;
    try {
      const result = await groupFormRef.current.open(group);
      if (result) {
        await loadGroups();
        if (!group?.id && result.id) {
          const { profile, setProfile } = useMeStore.getState();
          const whitelist = profile?.networkMonitoringGroupId ?? [];
          if (whitelist.length > 0 && !whitelist.includes(result.id)) {
            const updated = await userProfileRepository.update(profile._id, {
              title: profile.title,
              areas: profile.areas,
              permission: profile.permission,
              networkMonitoringGroupId: [...whitelist, result.id],
            });
            setProfile(updated);
          }
        }
      }
      return !!result;
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      return false;
    }
  }

  /**
   * @description Appends or updates a device in the state based on incoming ping records.
   * @param {NetworkMonitoringDevicePingRecords} device
   */
  function appendDevice(update) {
    // Sepenuhnya berbasis `prev` agar aman dipanggil dari listener socket yang
    // didaftarkan sekali (tidak bergantung closure `devices` yang bisa basi).
    setDevices((prev) => {
      const idx = prev.findIndex((d) => d.id === update.deviceId);
      if (idx === -1) return prev;

      const current = prev[idx];
      const next = { ...current };
      const isSecondary = update.ipRole === 'secondary' && update.secondaryIpId;

      if (isSecondary) {
        // Ping IP sekunder: perbarui entri sekundernya saja, JANGAN timpa status device.
        next.secondary_ip_addresses = (current.secondary_ip_addresses ?? []).map((sec) =>
          sec.id === update.secondaryIpId
            ? {
                ...sec,
                last_status: update.status,
                last_pinged_at: update.pingedAt,
                last_response_time_ms: update.responseTimeMs ?? null,
              }
            : sec
        );
      } else {
        next.primary_ip_status = {
          ...(current.primary_ip_status ?? { ip_address: current.ip_address }),
          last_status: update.status,
          last_pinged_at: update.pingedAt,
          last_response_time_ms: update.responseTimeMs ?? null,
        };
        next.last_pinged_at = update.pingedAt;
        next.last_response_time_ms = update.responseTimeMs ?? null;
      }

      // Status device = gabungan primary + semua sekunder, sama persis dengan
      // aturan backend (computeAggregateStatus) agar tidak "berkedip" saat
      // primary UP tapi salah satu sekunder DOWN.
      next.last_status = computeAggregateStatus([
        next.primary_ip_status?.last_status ?? (isSecondary ? current.last_status : update.status),
        ...(next.secondary_ip_addresses ?? []).map((s) => s.last_status),
      ]);

      const newDevices = [...prev];
      newDevices[idx] = next;
      return newDevices;
    });
  }

  /** Aturan sama dengan backend `computeAggregateStatus`. */
  function computeAggregateStatus(statuses) {
    const nonNull = statuses.filter((s) => s != null);
    if (nonNull.length === 0) return 'unknown';
    const hasConnected = nonNull.includes('connected');
    const hasDisconnected = nonNull.includes('disconnected');
    if (hasConnected && hasDisconnected) return 'semiconnected';
    if (hasConnected) return 'connected';
    return 'disconnected';
  }

  function handleNodeExpand(nodeId) {
    setExpandedNodeIds((prev) => {
      if (prev.includes(nodeId)) return prev;
      return [...prev, nodeId];
    });
  }

  function handleNodeCollapse(nodeId) {
    setExpandedNodeIds((prev) => {
      const descendants = getNetworkMonitoringDescendantIds(devices, nodeId);
      const toRemove = new Set([nodeId, ...descendants]);
      const next = prev.filter((id) => !toRemove.has(id));
      return next.length === prev.length ? prev : next;
    });
  }

  function handleHighlightNode(nodeId) {
    setHighlightedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }

  async function refreshTreeView() {
    await loadDevices();
    setTreeViewKey((current) => current + 1);
  }

  function toggleFullscreen() {
    if (!fullscreen.value) {
      containerRef.current?.requestFullscreen?.();
      fullscreen.onTrue();
    } else {
      document.exitFullscreen?.();
      fullscreen.onFalse();
    }
  }

  async function handleDelete(device) {
    const label = getNetworkMonitoringCategoryLabel(device.category);

    try {
      await confirm({
        title: 'Hapus',
        content: `Apakah anda yakin ingin menghapus ${label} beserta semua item yang terhubung?`,
        confirmationButtonProps: { color: 'error' },
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
      });

      await deleteDevice(device.id);
      toast.success('Device berhasil dihapus');
      await refreshTreeView();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function handleDeleteGroup() {
    const group = groups.find((g) => g.id === selectedGroupId);
    if (!group) return;

    try {
      await confirm({
        title: 'Hapus Group',
        content: `Apakah anda yakin ingin menghapus group "${group.name}" beserta semua device di dalamnya?`,
        confirmationButtonProps: { color: 'error' },
        confirmationText: 'Hapus',
        cancellationText: 'Batal',
      });

      await deleteGroup(group.id);
      toast.success('Group berhasil dihapus');
      localStorage.removeItem('networkMonitoring_selectedGroupId');
      setSelectedGroupId('');
      await loadGroups();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      localStorage.setItem('networkMonitoring_selectedGroupId', selectedGroupId);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    // Saat mount selectedGroupId masih '' → tanpa guard ini request pertama
    // mengambil SEMUA device lintas group (query terberat) lalu dibuang
    // begitu loadGroups() memilih group. Tunggu group terpilih dulu.
    if (!selectedGroupId) return;
    debouncedLoadDevices();
    setTreeViewKey((current) => current + 1);
  }, [selectedGroupId]);

  return {
    state: {
      devices,
      treeData,
      loading,
      fullscreen,
      groups,
      selectedGroupId,
      containerRef,
      treeViewKey,
      expandedNodeIds,
      highlightedNodeId,
    },
    handlers: {
      loadDevices,
      openFormDialog,
      openGroupFormDialog,
      appendDevice,
      setSelectedGroupId,
      refreshTreeView,
      toggleFullscreen,
      handleDelete,
      handleDeleteGroup,
      handleNodeExpand,
      handleNodeCollapse,
      handleHighlightNode,
    },
    refs: {
      form: formRef,
      groupForm: groupFormRef,
      sla: slaRef,
    },
  };
}
