import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, setHost } from "~/auth/slice/auth";
import { getAuth, getHost } from "@/src/auth/storage"

export function useAuthBootstrap() {
  const dispatch = useDispatch();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const load = async () => {

      const [ apiKey, userId, userName ] = await getAuth()
      const hostUrl = await getHost()

      if (hostUrl) dispatch(setHost({hostUrl}));

      if (apiKey && userId && userName) dispatch(setCredentials({ apiKey, userId, userName }));

      setBootstrapped(true);
    };
    load();
  }, []);

  return bootstrapped;
}
