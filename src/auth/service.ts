import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/src/store";
import { DeviceInfo, JellyfinLoginResponse, LoginRequest } from "./slice/types";
import { setCredentials } from "./slice/auth"
import { saveAuth } from "./storage"
import uuid from 'react-native-uuid'

const VERSION = 1

const apiBaseHeaders = (headers: Headers, deviceInfo: DeviceInfo | null) => {
  if (deviceInfo && deviceInfo.deviceId) {
    headers.set(
      "Authorization",
      `MediaBrowser Client="JellyKids", Device="${deviceInfo.deviceName}", DeviceId="${deviceInfo.deviceId}", Version="${VERSION}"`
    );
  } else {
    headers.set(
      "Authorization",
      `MediaBrowser Client="JellyKids", Device="Unknown", DeviceId="${uuid.v4()}", Version="${VERSION}"`
    );
  }
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  console.log(
    'RTK Headers:',
    Object.fromEntries(headers.entries())
  )
  return headers;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: async (args, api, extraOptions) => {
    const state = api.getState() as RootState;
    const hostUrl = state.auth.hostUrl!;
    const rawQuery = fetchBaseQuery({
      baseUrl: hostUrl,
      prepareHeaders: (headers) => apiBaseHeaders(headers, state.device),
    });
    console.log('[RTK QUERY] ➜ Request:', {
      baseUrl: hostUrl,
      method: args?.method ?? 'GET',
      url: args?.url,
      body: args?.body,
    });
    return rawQuery(args, api, extraOptions);
  },
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<JellyfinLoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/Users/authenticatebyname",
        method: "POST",
        body: {
          Username: credentials.username,
          Pw: credentials.password,
        },
      }),
      onQueryStarted: async (request, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled
        dispatch(setCredentials({ userId: data.User.Id, apiKey: data.AccessToken, userName: data.User.Name }))
        await saveAuth(data.User.Id, data.User.Name, data.AccessToken);
      },
      invalidatesTags: ['Auth']
    }),
  }),
});

export const {
  useLoginMutation,
} = authApi