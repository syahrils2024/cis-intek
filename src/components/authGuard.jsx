import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { setMe, setProfile, useMeStore } from 'src/stores/meStore';
import { authRepository, userProfileRepository } from 'src/repositories';

/**
 * @typedef {import('@/stores/meStore').MeStore} MeStore
 */

/**
 *
 * @param {{children: JSX} & MeStore} param0
 * @returns {JSX}
 */
function AuthGuard({ children, me }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const meStore = useMeStore((state) => state.me);
  const setMeStore = useMeStore((state) => state.setMe);
  const setProfileStore = useMeStore((state) => state.setProfile);
  const route = useLocation();

  const excludeNocRoute = ['/v2', '/v2/', '/v2/billing', '/v2/invoice-temp', '/v2/payment-method'];

  const excludeLORoute = ['/v2/payment-method', '/v2/stock', '/v2/duo-date-charge'];

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const path = route.pathname;
    const isAdminRoute = path.includes('/v2');

    const privilegesStorage = localStorage.getItem('privilege');
    const privileges = privilegesStorage ? JSON.parse(privilegesStorage) : [];
    const isNoc = privileges.includes('network_operation_center');
    const isLo = privileges.includes('liaison_officer');

    if (path === '/' && !token) {
      navigate('/login');
    } else if (isNoc && excludeNocRoute.includes(path)) {
      navigate('/v2/area-configuration');
    } else if (isLo && excludeLORoute.includes(path)) {
      navigate('/v2');
    } else if (path === '/' && !!token) {
      navigate('/v2');
    } else if (!!token && path === '/login') {
      navigate('/v2');
    } else if (isAdminRoute && !token) {
      navigate('/login');
    }
  };

  async function checkCurrentAuth() {
    if (me) return;
    const snapshotMe = await authRepository.getCurrentUser().catch(() => null);
    setMeStore(snapshotMe);
    dispatch(setMe(snapshotMe));

    if (snapshotMe?.profile) {
      const profile = await userProfileRepository.findOne(snapshotMe.profile).catch(() => null);
      setProfileStore(profile);
      dispatch(setProfile(profile));
    }
  }

  useEffect(() => {
    checkAuth();
    checkCurrentAuth();
  }, []);

  return <>{children}</>;
}

const mapStateToProps = (store) => store.meStore;
export default connect(mapStateToProps)(AuthGuard);
