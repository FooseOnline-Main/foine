import { useEffect, useState } from 'react';
import { getUserDetails } from '../api';
import { useJWT } from './index';
import { useHistory } from 'react-router-dom';

export function useAuthentication() {
  const [jwt] = useJWT();
  const [user, setUser] = useState({});
  const history = useHistory();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const response = await getUserDetails(jwt);
      console.log({response})
      if (response && response.data.success) {
        setLoading(false);
        setUser(response.data.payload.user);
      } else {
        window.localStorage.removeItem('_fu_jwt');
        history.push("/");
        setLoading(false);
      }
    })();
  }, []);

  return [user, isLoading];
}

export function useCheckAuth() {
  const [jwt] = useJWT();
  const history = useHistory();

  useEffect(() => {
    (async () => {
      if (jwt.length < 1) {
        history.replace("/");
        window.localStorage.removeItem('_history');
        // const page = window.localStorage.getItem('_history') || '/dashboard';
        // await history.replace(page);
      }
    })();
  }, [jwt]);
}
