import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type JellyfinItemsResponse } from "./types";
import { RootState } from "@/src/store";

const apiBaseHeaders = (headers: Headers, token: string | null) => {
  if (token) {
    headers.set("Authorization", "MediaBrowser Token=" + token);
  }
  headers.set("Accept", "application/json");
  return headers;
};

export const collectionApi = createApi({
  reducerPath: "collectionApi",
  baseQuery: async (args, api, extraOptions) => {
    const state = api.getState() as RootState;
    const token = state.auth.apiKey;
    const hostUrl = state.auth.hostUrl!;
    const rawQuery = fetchBaseQuery({
      baseUrl: hostUrl,
      prepareHeaders: (headers) => apiBaseHeaders(headers, token),
    });
    return rawQuery(args, api, extraOptions);
  },
  tagTypes: ["Collection", "Library"],
  endpoints: (builder) => ({
    getUserCollections: builder.query<
      JellyfinItemsResponse,
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/Users/${userId}/Items`,
      }),
      providesTags: ["Collection"],
    }),
    getUserLibrary: builder.query<JellyfinItemsResponse, { userId: string }>({
      query: ({ userId }) => ({
        url: `/Users/${userId}/Items?Recursive=true&IncludeItemTypes=Movie,Series&SortBy=SortName`,
      }),
      providesTags: ["Library"],
    }),
  }),
});

export const { useGetUserCollectionsQuery, useGetUserLibraryQuery } =
  collectionApi;
