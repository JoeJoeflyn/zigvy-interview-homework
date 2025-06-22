import { getUserInfo } from '@/api/user';
import { getAccessToken } from '@/lib/cookies';
import { useUserStore } from '@/store/user';
import { useEffect } from 'react';

// hook to init user info if token exists
export function useInitUser() {
  useEffect(() => {
    const init = async () => {
      const token = getAccessToken();

      if (!token) {
        useUserStore.getState().clearUser();
        return;
      }

      try {
        const user = await getUserInfo();
        useUserStore.getState().setUser(user);
      } catch (error) {
        console.log('error in UseInituser', error);
        useUserStore.getState().clearUser();
      }
    };

    init();
  }, []);
}
