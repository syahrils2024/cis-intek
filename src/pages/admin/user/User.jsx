/**
 * @typedef {import("src/stores/userStore").UserStore} UserStore
 * @typedef {import('src/repositories/user').User} User
 * @typedef {import('src/stores/meStore').MeStore} MeStore
 */
import { connect } from 'react-redux';
import Overloading from '@components/overloading';
import UserFormDialog from '@components/user/formDialog';
import UserActivityExport from '@components/UserActivity/export';

import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { usePrivilege } from 'src/auth/hooks/privileges';

import { useUserState } from './user.state';
import UserTabs from './components/UserTabs';
import UserTable from './components/UserTable';
import UserToolbar from './components/UserToolbar';
import MobileSection from './components/MobileSection';

/**
 * @param {UserStore & MeStore} props
 */
function User({ admin, engineer, marketing, noc, lo, me }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isDeveloper } = usePrivilege();

  const {
    state: {
      users,
      selectedTab,
      orderBy,
      order,
      search,
      loading,
      showForm,
      selectedUser,
      availableTabs,
      meData,
    },
    handlers,
    refs,
  } = useUserState({ admin, noc, engineer, marketing, lo, me, isMobile });

  return (
    <>
      <Grid container spacing={2} className="tw-w-full tw-mx-auto tw-p-5">
        <UserToolbar
          search={search}
          onSearchChange={handlers.setSearch}
          allowCreate={me?.permission?.allowCreateUser}
          onAdd={handlers.onAdd}
        />

        <UserTabs
          selectedTab={selectedTab}
          onTabChange={handlers.setSelectedTab}
          tabs={availableTabs}
        />

        <Grid columns={12} className="tw-w-full tw-relative tw-flex tw-flex-col tw-gap-2">
          <Overloading loading={loading.value} />
          {isMobile ? (
            users?.map((u, i) => (
              <MobileSection
                key={i}
                user={u}
                onEdit={() => handlers.onEditUser(u)}
                onRemove={() => handlers.removeUser(u)}
                onToggleLock={() => handlers.toggleLockUser(u)}
                allowEdit={me?.permission?.allowEditUser}
                allowRemove={
                  meData?._id?.toString() !== u._id.toString() &&
                  !!me?.permission?.allowEditUser
                }
                isDeveloper={isDeveloper}
              />
            ))
          ) : (
            <UserTable
              users={users}
              orderBy={orderBy}
              order={order}
              onSort={handlers.sort}
              onEdit={handlers.onEditUser}
              onRemove={handlers.removeUser}
              onToggleLock={handlers.toggleLockUser}
              onExportActivity={(id) => refs.userActivityExport.current.open(id)}
              allowEdit={me?.permission?.allowEditUser}
              meData={meData}
              isDeveloper={isDeveloper}
            />
          )}
        </Grid>
      </Grid>
      <UserFormDialog
        show={showForm}
        onClose={handlers.onClose}
        selectedUser={selectedUser}
        handlerSubmit={handlers.onSubmitForm}
        isLoading={loading.value}
      />
      <UserActivityExport ref={refs.userActivityExport} />
    </>
  );
}

/** @param {{userStore: UserStore; meStore: MeStore}} */
const mapsStateToProps = ({ userStore, meStore }) => {
  const { admin, engineer, marketing, noc, lo } = userStore;
  return { admin, engineer, marketing, noc, lo, me: meStore.me };
};

export default connect(mapsStateToProps)(User);
