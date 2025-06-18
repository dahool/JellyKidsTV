import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/src/store";
import { DeviceInfo, JellyfinLoginResponse, LoginRequest } from "./slice/types";
import { setCredentials } from "./slice/auth"
import { saveAuth } from "./storage"

const apiBaseHeaders = (headers: Headers, deviceInfo: DeviceInfo | null) => {
  if (deviceInfo) {
    headers.set(
      "Authorization",
      `MediaBrowser Client="JellyKids", Device="${deviceInfo.deviceName}", DeviceId="${deviceInfo.deviceId}", Version="1"`
    );
  } else {
    headers.set(
      "Authorization",
      `MediaBrowser Client="JellyKids", Device="Unknown", DeviceId="Unknown", Version="1"`
    );
  }
  headers.set("Accept", "application/json");
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