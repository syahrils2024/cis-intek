/**
 * @typedef {import("src/stores/userProfileStore").UserProfileStore} UserProfileStore
 * @typedef {import('src/repositories/userProfile').UserProfile} UserProfile
 */

import { useRef } from 'react';
import { connect } from 'react-redux';
import { Iconify } from '@components/iconify';
import { usePermission } from '@auth/hooks/permission';
import UserProfileForm from '@components/userProfile/form';
import UserProfileTable from '@components/userProfile/table';
import UserProfileMobile from '@components/userProfile/mobile';

import { Button, useTheme, Typography, useMediaQuery } from '@mui/material';

import { useUserProfileState } from './userProfile.state';

/**
 * @param {UserProfileStore} param0
 */
function UserProfile({ data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const userProfileFormRef = useRef();
  const permission = usePermission();

  const { openForm, remove, duplicate } = useUserProfileState(userProfileFormRef, data);

  return (
    <>
      <div className="tw-flex tw-flex-col tw-w-full tw-p-5">
        <div className="tw-flex tw-flex-row tw-gap-2 tw-w-full tw-items-center tw-justify-between">
          <Typography variant="h4">User Profile</Typography>
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-2 tw-items-center tw-justify-end">
            <Button
              variant="contained"
              color="success"
              className="tw-self-end"
              onClick={() => openForm()}
              disabled={!permission?.editProfile}
            >
              <Iconify icon="ic:baseline-plus" fontSize={20} /> {!isMobile && 'Tambah Profile'}
            </Button>
          </div>
        </div>
        <div className="tw-flex tw-flex-col tw-mt-4">
          {isMobile ? (
            <UserProfileMobile
              profiles={data}
              onEdit={(p) => openForm(p._id)}
              onDelete={(p) => remove(p)}
              disabledAction={!permission?.editProfile}
              onDuplicate={(p) => duplicate(p._id)}
            />
          ) : (
            <UserProfileTable
              profiles={data}
              onEdit={(p) => openForm(p._id)}
              onDelete={(p) => remove(p)}
              disabledAction={!permission?.editProfile}
              onDuplicate={(p) => duplicate(p._id)}
            />
          )}
        </div>
      </div>
      <UserProfileForm ref={userProfileFormRef} />
    </>
  );
}
const mapStateToProps = (state) => state.userProfileStore;

export default connect(mapStateToProps)(UserProfile);
