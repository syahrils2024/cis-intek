/**
 * @typedef {import("src/stores/userStore").UserStore} UserStore
 * @typedef {import('src/repositories/user').User} User
 * @typedef {import('src/repositories/user').UserRequest} UserRequest
 * @typedef {import('src/stores/meStore').MeStore} MeStore
 */
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { useBoolean } from '@hooks/use-boolean';
import { useConfirm } from 'material-ui-confirm';
import { useRef, useMemo, useState, useEffect } from 'react';

import { useMeStore } from 'src/stores/meStore';
import { userRepository } from 'src/repositories';
import { lockUser, unlockUser } from 'src/repositories/user';
import { setLo, setNoc, setAdmin, setEngineer, setMarketing } from 'src/stores/userStore';

import { buildPrivileges, getAvailableTabs, filterAndSortUsers } from './user.helper';

/**
 * @typedef {Object} UserState
 * @property {User[]} admin
 * @property {User[]} noc
 * @property {User[]} engineer
 * @property {User[]} marketing
 * @property {User[]} lo
 * @property {object} me
 * @property {number} selectedTab
 * @property {string} orderBy
 * @property {'asc'|'desc'} order
 * @property {string} search
 * @property {object} loading
 * @property {boolean} showForm
 * @property {User|null} selectedUser
 * @property {User[]} users
 * @property {string[]} availableTabs
 * @property {boolean} isMobile
 */

/**
 * @typedef {Object} UserHandlers
 * @property {(tab: number) => void} setSelectedTab
 * @property {(key: string) => void} setOrderBy
 * @property {(dir: 'asc'|'desc') => void} setOrder
 * @property {(value: string) => void} setSearch
 * @property {() => void} onAdd
 * @property {(user: User) => void} onEdit
 * @property {(user: User) => Promise<void>} removeUser
 * @property {(user: User) => Promise<void>} toggleLockUser
 * @property {() => void} onClose
 * @property {() => Promise<void>} prefetch
 * @property {(user: UserRequest) => Promise<void>} onSubmitForm
 * @property {(key: string) => void} sort
 */

/**
 * @typedef {Object} UserRefs
 * @property {React.RefObject} userActivityExport
 */

/**
 * Custom hook for user management state and logic.
 * @param {object} props - Redux-connected props
 * @param {User[]} props.admin
 * @param {User[]} props.noc
 * @param {User[]} props.engineer
 * @param {User[]} props.marketing
 * @param {User[]} props.lo
 * @param {object} props.me
 * @param {boolean} props.isMobile
 * @returns {{ state: UserState, handlers: UserHandlers, refs: UserRefs }}
 */
export function useUserState({ admin, noc, engineer, marketing, lo, me, isMobile }) {
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const meData = useMeStore();

  const [selectedTab, setSelectedTab] = useState(0);
  const [orderBy, setOrderBy] = useState('fullname');
  const [order, setOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const loading = useBoolean(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelecterUser] = useState(null);
  const userActivityExportRef = useRef();

  const availableTabs = useMemo(() => getAvailableTabs(me?.privilege), [me?.privilege]);

  const users = useMemo(
    () => filterAndSortUsers(admin, noc, engineer, marketing, lo, selectedTab, search, orderBy, order),
    [admin, noc, engineer, marketing, lo, selectedTab, search, orderBy, order]
  );

  const onAdd = () => {
    setSelecterUser(null);
    setShowForm(true);
  };

  const onEdit = (user) => {
    setSelecterUser(user);
    setShowForm(true);
  };

  async function removeUser(user) {
    try {
      await confirm({
        title: 'Hapus User',
        description: `Apakah anda ingin menghapus user ${user.fullname}`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });

      await userRepository.removeUser(user._id);
      await prefetch();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }

  async function toggleLockUser(user) {
    const isLocking = user.locked;
    try {
      await confirm({
        title: !isLocking ? 'Lock User' : 'Unlock User',
        description: `Apakah anda ingin ${!isLocking ? 'mengunci' : 'membuka kunci'} user ${user.fullname}?`,
        confirmationText: !isLocking ? 'Lock' : 'Unlock',
        confirmationButtonProps: { color: !isLocking ? 'error' : 'primary', variant: 'contained' },
        cancellationText: 'Batal',
        cancellationButtonProps: { color: 'error', variant: 'text' },
      });

      await toast.promise(
        !isLocking ? lockUser(user._id) : unlockUser(user._id),
        {
          loading: !isLocking ? 'Mengunci user...' : 'Membuka kunci user...',
          success: () => {
            prefetch();
            return !isLocking ? 'User berhasil dikunci' : 'User berhasil dibuka';
          },
          error: (err) => err.message ?? 'Gagal memproses',
        }
      );
    } catch (error) {
      if (error instanceof Error && !error.message?.includes('promise')) {
        toast.error(error.message);
      }
    }
  }

  const onClose = () => {
    setShowForm(false);
    setSelecterUser(null);
  };

  const prefetch = async () => {
    loading.onTrue();
    try {
      const snapshotAdmin = await userRepository.getUserByPrivilege('admin');
      dispatch(setAdmin(snapshotAdmin));

      const snapshotEngineer = await userRepository.getUserByPrivilege('engineer');
      dispatch(setEngineer(snapshotEngineer));

      const snapshotMarketing = await userRepository.getUserByPrivilege('marketing');
      dispatch(setMarketing(snapshotMarketing));

      const snapshotNoc = await userRepository.getUserByPrivilege('network_operation_center');
      dispatch(setNoc(snapshotNoc));

      const snapshotLo = await userRepository.getUserByPrivilege('liaison_officer');
      dispatch(setLo(snapshotLo));
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      loading.onFalse();
    }
  };

  /** @param {User} user */
  const onEditUser = (user) => {
    onEdit(user);
  };

  /**
   * @param {UserRequest} user
   */
  const onSubmitForm = async (user) => {
    if (selectedUser) user.id = selectedUser._id;
    user.privilege = buildPrivileges(user);
    user.areas = user.areaCategory ?? [];
    loading.onTrue();
    try {
      if (user.privilege.length <= 0) throw new Error('Pilih privilege');
      await userRepository.createUser(user);
      await prefetch();
      toast.success('Berhasil disimpan');
      setShowForm(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      loading.onFalse();
    }
  };

  function sort(key) {
    if (key !== orderBy) {
      setOrderBy(key);
      setOrder('asc');
    } else {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }
  }

  useEffect(() => {
    prefetch();
  }, []);

  return {
    state: {
      admin,
      noc,
      engineer,
      marketing,
      lo,
      me,
      selectedTab,
      orderBy,
      order,
      search,
      loading,
      showForm,
      selectedUser,
      users,
      availableTabs,
      isMobile,
      meData: meData.me,
    },
    handlers: {
      setSelectedTab,
      setOrderBy,
      setOrder,
      setSearch,
      onAdd,
      onEdit,
      removeUser,
      toggleLockUser,
      onClose,
      prefetch,
      onEditUser,
      onSubmitForm,
      sort,
    },
    refs: {
      userActivityExport: userActivityExportRef,
    },
  };
}
