/**
 * @typedef {import('src/repositories/userProfile').UserProfile} UserProfile
 */

import { toast } from 'sonner';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useConfirm } from 'material-ui-confirm';

import { userProfileRepository } from 'src/repositories';
import { setUserProfileStore } from 'src/stores/userProfileStore';

/**
 * Custom hook for user profile state management
 * @param {React.RefObject} userProfileFormRef - Reference to the form component
 * @param {Array} data - Current user profiles data
 * @returns {Object} State management functions
 */
export function useUserProfileState(userProfileFormRef, data) {
  const dispatch = useDispatch();
  const confirm = useConfirm();

  /**
   * Fetch user profiles from repository and update store
   */
  const prefetch = async () => {
    try {
      const snapshot = await userProfileRepository.list();
      dispatch(setUserProfileStore({ key: 'data', value: snapshot }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * Open user profile form dialog
   * @param {string} id - User profile ID (optional for new profile)
   */
  const openForm = async (id) => {
    const result = await userProfileFormRef.current.open(id);
    if (!result) return;
    await prefetch();
  };

  /**
   * Open user profile form dialog for duplication
   * @param {string} id - User profile ID (optional for new profile)
   */
  const duplicate = async (id) => {
    const result = await userProfileFormRef.current.open(id, true);
    if (!result) return;
    await prefetch();
  };

  /**
   * Remove a user profile
   * @param {UserProfile} profile - Profile to remove
   */
  const remove = async (profile) => {
    try {
      await confirm({
        title: 'Hapus Profile',
        description: `Apakah anda ingin menghapus profile ${profile.title} ? user yang masih tertaut tidak akan hilang profilenya kecuali anda mengganti secara manual user tersebut`,
        confirmationText: 'Hapus',
        confirmationButtonProps: { color: 'error', variant: 'contained' },
        cancellationText: 'Batal',
        confirmationKeywordTextFieldProps: { color: 'primary', variant: 'text' },
      });

      await userProfileRepository.remove(profile._id);
      toast.info('Berhasil menghapus');
      await prefetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (data.length <= 0) prefetch();
  }, []);

  return {
    openForm,
    remove,
    prefetch,
    duplicate,
  };
}
