/* eslint-disable prefer-destructuring */
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useBoolean } from '@hooks/use-boolean';
import { useAppPicker } from '@hooks/use-app-picker';

import {
  whatsappNodeRepository,
  networkMonitoringRepository,
  networkMonitoringNotificationRepository,
} from 'src/repositories';

import {
  mapSecondaryIpStatusesToRequest,
  createEmptyNetworkMonitoringChild,
  createNetworkMonitoringChildPayload,
  createNetworkMonitoringDevicePayload,
} from '../networkMonitoringHelper';

/**
 * @typedef {import("src/repositories/networkMonitoring").NetworkMonitoringDevice} NetworkMonitoringDevice
 */

/**
 * @typedef {Object} OpenOptions
 * @property {NetworkMonitoringDevice} [device]
 * @property {NetworkMonitoringDevice[]} [children]
 * @property {boolean} [availableSelectParent]
 * @property {string} [groupId]
 */

export function useFormDialogState() {
  const resolver = useRef();

  const open = useBoolean(false);
  const loading = useBoolean(false);
  const loadingData = useBoolean(false);
  const appPicker = useAppPicker();

  /** @type {[NetworkMonitoringDevice, function]} */
  const [currentData, setCurrentData] = useState(null);
  const [deviceName, setDeviceName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('device');
  const [parentId, setParentId] = useState(null);
  const [groupId, setGroupId] = useState('');
  const [iconName, setIconName] = useState('circle-outline');
  const [devices, setDevices] = useState([]);
  const [whatsappNodes, setWhatsappNodes] = useState([]);
  const [whatsappNotifications, setWhatsappNotifications] = useState([]);
  const [secondaryIpAddresses, setSecondaryIpAddresses] = useState([]);
  const availableSelectParent = useBoolean(false);

  const [removedChildrenIds, setRemovedChildrenIds] = useState([]);

  /** @type {[NetworkMonitoringDevice[], function]} */
  const [children, setChildren] = useState([]);

  async function fetchDevices({ group = null } = {}) {
    try {
      const [devicesResult, whatsappNodesResult] = await Promise.all([
        networkMonitoringRepository.getDevices({ group }),
        whatsappNodeRepository.getWhatsappNode(),
      ]);
      setDevices(devicesResult);
      setWhatsappNodes(whatsappNodesResult);
    } catch (error) {
      console.error(error);
    }
  }

  /** @param {OpenOptions} options */
  async function openDialog(options) {
    open.onTrue();
    loadingData.onTrue();
    setCurrentData(options.device ?? null);
    setDeviceName(options.device?.alias ?? '');
    setIpAddress(options.device?.ip_address ?? '');
    setDescription(options.device?.description ?? '');
    setChildren(options.children ?? []);
    setCategory(options.device?.category ?? 'device');
    setParentId(options.device?.parent_id ?? null);
    setGroupId(options.device?.group_id ?? options.groupId ?? '');
    setIconName(options.device?.icon ?? 'circle-outline');
    setSecondaryIpAddresses(
      mapSecondaryIpStatusesToRequest(options.device?.secondary_ip_addresses)
    );
    availableSelectParent.setValue(options.availableSelectParent ?? false);

    await fetchDevices({ group: options.groupId ?? options.device?.group_id ?? null });

    if (options.device?.id) {
      try {
        const notifications = await networkMonitoringNotificationRepository.getByDevice(
          options.device.id
        );
        setWhatsappNotifications(
          notifications.map((n) => ({
            whatsappNode: n.whatsappNode,
            to: n.to,
            category: n.category,
            notificationTemplate: n.notificationTemplate ?? null,
          }))
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      setWhatsappNotifications([]);
    }

    loadingData.onFalse();

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  async function submit() {
    const shouldUpdate = !!currentData?.id;
    loading.onTrue();
    try {
      validateBeforeSubmit();
      let id;

      if (shouldUpdate) {
        const result = await networkMonitoringRepository.updateDevice(
          currentData.id,
          createNetworkMonitoringDevicePayload({
            alias: deviceName,
            ipAddress,
            description,
            category,
            parentId,
            groupId,
            iconName,
            secondaryIpAddresses,
          })
        );
        id = result.id;
      } else {
        const result = await networkMonitoringRepository.addDevice(
          createNetworkMonitoringDevicePayload({
            alias: deviceName,
            ipAddress,
            description,
            category,
            parentId,
            groupId,
            iconName,
            secondaryIpAddresses,
          })
        );
        id = result.id;
      }

      await networkMonitoringNotificationRepository.upsertNotifications({
        deviceId: id,
        items: whatsappNotifications.map((n) => ({
          to: n.to,
          whatsappNode: n.whatsappNode,
          category: n.category,
          notificationTemplate: n.notificationTemplate,
        })),
      });

      const insertedChildren = children.filter((child) => !child.id);
      const promiseInsertChildren = insertedChildren.map(async (child) => {
        await networkMonitoringRepository.addDevice(
          createNetworkMonitoringChildPayload(child, id, groupId)
        );
      });

      const updatedChildren = children.filter((child) => child.id);

      const promiseUpdateChildren = updatedChildren.map(async (child) => {
        await networkMonitoringRepository.updateDevice(
          child.id,
          createNetworkMonitoringChildPayload(child, id, groupId)
        );
      });

      await Promise.all([...promiseInsertChildren, ...promiseUpdateChildren]);
      toast.success('Berhasil menyimpan');
      close(true);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  }

  async function pickArea() {
    const result = await appPicker.area.open('', false);
    if (!result) return;

    const existsInChildren = children.some((child) => child.id === result._id);
    if (existsInChildren) return;

    /** @type {NetworkMonitoringDevice} */
    const newChild = {
      ip_address: result.ipRemote,
      alias: result.title,
    };

    setChildren((prev) => [...prev, newChild]);
  }

  function reset() {
    setCurrentData(null);
    setChildren([]);
    setDeviceName('');
    setIpAddress('');
    setDescription('');
    setGroupId('');
    setIconName('circle-outline');
    setRemovedChildrenIds([]);
    setWhatsappNotifications([]);
    setSecondaryIpAddresses([]);
    open.onFalse();
  }

  function close(shoudlRefresh = false) {
    reset();
    resolver.current?.(shoudlRefresh);
  }

  function validateBeforeSubmit() {
    if (!deviceName.trim()) {
      throw new Error('Device name is required');
    }

    const isValidateIp = category === 'device' ? !!ipAddress.trim() : true;

    if (!isValidateIp) {
      throw new Error('IP address is required');
    }
  }

  function addChild() {
    setChildren((prev) => [...prev, createEmptyNetworkMonitoringChild()]);
  }

  /** @param {number} index */
  function removeChild(index) {
    setChildren((prev) => {
      const child = prev[index];
      if (child?.id) {
        setRemovedChildrenIds((prevIds) => [...prevIds, child.id]);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  /**
   * @param {number} index
   * @param {Partial<NetworkMonitoringDevice>} data
   */
  function updateChild(index, data) {
    const copy = [...children];
    const child = copy[index];
    if (!child) return;
    if (data.ip_address !== undefined) child.ip_address = data.ip_address;
    if (data.alias !== undefined) child.alias = data.alias;
    if (data.category !== undefined) child.category = data.category;
    if (data.description !== undefined) child.description = data.description;
    if (data.secondary_ip_addresses !== undefined)
      child.secondary_ip_addresses = data.secondary_ip_addresses;

    setChildren(copy);
  }

  function addSecondaryIpAddress() {
    setSecondaryIpAddresses((prev) => [...prev, { ip_address: '', label: '' }]);
  }

  function removeSecondaryIpAddress(index) {
    setSecondaryIpAddresses((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSecondaryIpAddress(index, data) {
    const copy = [...secondaryIpAddresses];
    copy[index] = { ...copy[index], ...data };
    setSecondaryIpAddresses(copy);
  }

  function addWhatsappNotification() {
    setWhatsappNotifications((prev) => [
      ...prev,
      { whatsappNode: '', to: '', category: 'children', notificationTemplate: null },
    ]);
  }

  function removeWhatsappNotification(index) {
    setWhatsappNotifications((prev) => prev.filter((_, i) => i !== index));
  }

  function updateWhatsappNotification(index, data) {
    const copy = [...whatsappNotifications];
    copy[index] = { ...copy[index], ...data };
    setWhatsappNotifications(copy);
  }

  return {
    state: {
      open,
      loading,
      loadingData,
      currentData,
      deviceName,
      ipAddress,
      description,
      children,
      category,
      parentId,
      groupId,
      iconName,
      secondaryIpAddresses,
      devices: devices.filter((d) => d.id !== currentData?.id),
      whatsappNodes,
      whatsappNotifications,
    },
    handlers: {
      openDialog,
      submit,
      close,
      setDeviceName,
      setIpAddress,
      setDescription,
      pickArea,
      setCategory,
      setParentId,
      setGroupId,
      setIconName,
      secondaryIp: {
        add: addSecondaryIpAddress,
        remove: removeSecondaryIpAddress,
        update: updateSecondaryIpAddress,
      },
      child: {
        add: addChild,
        remove: removeChild,
        update: updateChild,
      },
      whatsappNotification: {
        add: addWhatsappNotification,
        remove: removeWhatsappNotification,
        update: updateWhatsappNotification,
      },
    },
  };
}
