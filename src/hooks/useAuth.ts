import { useFetch } from './useFetch';
import { useEffect, useMemo } from 'react';
import { getUser } from '../services/userApi/getUser';
import { dayjs } from '../utils/dayjs';
import { login } from '../services/userApi/login';
import constate from 'constate';
import { userState } from '../recoil/user';
import { useRecoilState } from 'recoil';
import { useLocalStorage } from 'react-use';
import * as R from 'ramda';
import { userTierType } from '../constants/userTierType';
import { message } from 'antd';
import { useHistory, useLocation } from 'react-router';

export const [UserAuthProvider, useAuth] = constate(() => {
  const browserHistory = useHistory();
  const { fetchData: fetchUser } = useFetch(getUser);
  const { fetchData: performLogin } = useFetch(login);
  const [idToken, setIdToken, removeIdToken] = useLocalStorage<string>(
    'id_token',
    undefined,
    { raw: true }
  );
  const [
    tokenExpireAt,
    setTokenExpireAt,
    removeTokenExpireAt,
  ] = useLocalStorage<string>('expires_at', undefined, { raw: true });
  const { pathname } = useLocation();

  const [user, setUser] = useRecoilState(userState);
  const isLoggedIn = !R.isNil(idToken);

  const handleLogout = () => {
    removeIdToken();
    removeTokenExpireAt();
    setUser(null);
  };

  const updateToken = () => {
    if (tokenExpireAt && dayjs().isAfter(tokenExpireAt)) {
      handleLogout();
    }
  };

  const refreshUser = async () => {
    const { result, success } = await fetchUser();
    result && success && setUser(result);
  };

  useEffect(() => {
    updateToken();
    idToken && refreshUser();
  }, [idToken]);

  const handleLogin = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const { result, success, error } = await performLogin({
      username,
      password,
    });

    if (success && result) {
      setIdToken(result.token);
      setTokenExpireAt(result.expires);
      await refreshUser();
    } else {
      error === 'USER_NOT_FOUND' &&
        message.error('Username or password mismatch');
    }
  };

  const tiers = useMemo(() => {
    const tier = user ? user.tier : undefined;

    return {
      isAdmin: tier === userTierType.ADMIN,
      isStudent: tier === userTierType.STUDENT,
      isTeacher: tier === userTierType.TEACHER,
      isInvigilator:
        tier === userTierType.TEACHER || tier === userTierType.ADMIN,
    };
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) {
      R.includes(pathname, ['/login']) && browserHistory.push('/');
    } else {
      !R.includes(pathname, ['/login']) && browserHistory.push('/login');
    }
  }, [isLoggedIn, pathname]);

  return {
    user,
    tier: user && user.tier,
    logout: handleLogout,
    login: handleLogin,
    isLoggedIn,
    isAuthing: isLoggedIn ? !user : false,
    ...tiers,
  };
});
