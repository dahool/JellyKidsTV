import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import uuid from "react-native-uuid";
import {
  DeviceInfo,
  JellyfinLoginResponse,
  JellyfinQuickConnectState,
  LoginRequest,
} from "../slice/types";
import { setCredentials } from "../slice/auth";
import { saveAuth } from "../storage";
import {
  Subject,
  timer,
  switchMap,
  takeUntil,
  filter,
  firstValueFrom,
  from,
} from "rxjs";

const VERSION = 1;

const buildHeaders = (deviceInfo: DeviceInfo | null): Headers => {
  const headers = new Headers();
  const deviceId = deviceInfo?.deviceId || uuid.v4();
  const deviceName = deviceInfo?.deviceName || "Unknown";
  headers.set(
    "Authorization",
    `MediaBrowser Client="JellyKids", Device="${deviceName}", DeviceId="${deviceId}", Version="${VERSION}"`
  );
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  return headers;
};

export const useLogin = () => {
  const dispatch = useDispatch();
  const hostUrl = useSelector((state: RootState) => state.auth.hostUrl)!;
  const deviceInfo = useSelector((state: RootState) => state.device);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    credentials: LoginRequest
  ): Promise<JellyfinLoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${hostUrl}/Users/authenticatebyname`, {
        method: "POST",
        headers: buildHeaders(deviceInfo),
        body: JSON.stringify({
          Username: credentials.username,
          Pw: credentials.password,
        }),
      });

      if (!response.ok) {
        if (response.status == 401) {
          throw new Error(`Login failed: Invalid user`);
        }
        throw new Error(`Login failed: ${response.status}`);
      }

      const data: JellyfinLoginResponse = await response.json();

      dispatch(
        setCredentials({
          userId: data.User.Id,
          apiKey: data.AccessToken,
          userName: data.User.Name,
        })
      );

      await saveAuth(data.User.Id, data.User.Name, data.AccessToken);

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error("Login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export const useInitiateQuickConnect = () => {
  const hostUrl = useSelector((state: RootState) => state.auth.hostUrl)!;
  const deviceInfo = useSelector((state: RootState) => state.device);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateQuickConnect =
    async (): Promise<JellyfinQuickConnectState> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${hostUrl}/QuickConnect/Initiate`, {
          method: "POST",
          headers: buildHeaders(deviceInfo),
        });

        if (!response.ok) {
          if (response.status == 401) {
            throw new Error(`Login failed: Quick Connect disabled.`);
          }
          throw new Error(`Login failed: ${response.status}`);
        }

        const data: JellyfinQuickConnectState = await response.json();

        return data;
      } catch (err: any) {
        setError(err.message);
        console.error("Login error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    };

  return { initiateQuickConnect, loading, error };
};


export const useAuthenticateWithQuickConnect = () => {
  const dispatch = useDispatch();
  const hostUrl = useSelector((state: RootState) => state.auth.hostUrl)!;
  const deviceInfo = useSelector((state: RootState) => state.device);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retrieveQuickConnectState = (qcState: JellyfinQuickConnectState) => {
    const params = new URLSearchParams({ secret: qcState.Secret });
    return fetch(`${hostUrl}/QuickConnect/Connect?${params.toString()}`, {
      method: "GET",
      headers: buildHeaders(deviceInfo),
    }).then((res) => {
      if (!res.ok) {
        if (res.status === 401) throw new Error("Login failed: Invalid user");
        throw new Error(`Login failed: ${res.status}`);
      }
      return res.json();
    }) as Promise<JellyfinQuickConnectState>;
  };

  const cancel$ = new Subject<void>();

  const authenticateWithQuickConnect = async (
    qcState: JellyfinQuickConnectState
  ): Promise<JellyfinLoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const polling$ = timer(0, 5000).pipe(
        switchMap(() => from(retrieveQuickConnectState(qcState))),
        filter((state) => state.Authenticated),
        takeUntil(cancel$)
      );

      const authenticatedState = await firstValueFrom(polling$);
      
      if (!authenticatedState.Authenticated) return null;

      const response = await fetch(
        `${hostUrl}/Users/AuthenticateWithQuickConnect`,
        {
          method: "POST",
          headers: buildHeaders(deviceInfo),
          body: JSON.stringify({ Secret: qcState.Secret }),
        }
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Login failed: Invalid user");
        throw new Error(`Login failed: ${response.status}`);
      }

      const data: JellyfinLoginResponse = await response.json();

      dispatch(
        setCredentials({
          userId: data.User.Id,
          apiKey: data.AccessToken,
          userName: data.User.Name,
        })
      );

      await saveAuth(data.User.Id, data.User.Name, data.AccessToken);

      return data;
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError(err.message);
        console.error("Login error:", err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelQuickConnect = () => cancel$.next();

  return { authenticateWithQuickConnect, cancelQuickConnect, loading, error };
};
