import {
  BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { type JellyfinServer } from "./types";
import { RootState } from "@/src/store"

const dynamicBaseQuery: BaseQueryFn<any, unknown, unknown> = async (
  args,
  api,
  extraOptions
) => {
  const state = api.getState() as RootState;

  const baseUrl = args?.baseUrl ?? state.auth.hostUrl;
  if (!baseUrl) {
    throw new Error("baseUrl is required but was not provided");
  }

  const rawArgs = { ...args };
  delete rawArgs.baseUrl;

  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => headers.set("Accept", "application/json"),
  });

  return baseQuery(rawArgs, api, extraOptions);
};

export const serverApi = createApi({
  reducerPath: "serverApi",
  baseQuery: dynamicBaseQuery,
  tagTypes: ["Server"],
  endpoints: (builder) => ({
    getServerInfo: builder.query<JellyfinServer, { baseUrl?: string } | void>({
      query: (arg) => ({
        baseUrl: arg?.baseUrl,
        url: "System/Info/Public",
      }),
      providesTags: ["Server"],
    }),
  }),
});

export const { useGetServerInfoQuery, useLazyGetServerInfoQuery } = serverApi;
