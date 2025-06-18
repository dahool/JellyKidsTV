import { configureStore } from '@reduxjs/toolkit';
import { collectionApi } from '~/services/api/playlist';
import authSlice from '~/auth/slice/auth'
import deviceSlice from '~/auth/slice/device'
import { authApi } from '../auth/service'
import { serverApi } from '../services/api/server'

export const store = configureStore({
  reducer: {
    // Add the generated API reducer to the store
    [collectionApi.reducerPath]: collectionApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [serverApi.reducerPath]: serverApi.reducer,
    auth: authSlice.reducer,
    device: deviceSlice.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, and other RTK Query features
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(collectionApi.middleware, authApi.middleware, serverApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;