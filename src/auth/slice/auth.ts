import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState } from './types'

const initialState: AuthState = {
  userName: null,
  apiKey: null,
  userId: null,
  hostUrl: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ apiKey: string; userId: string; userName: string; }>) {
      state.apiKey = action.payload.apiKey
      state.userId = action.payload.userId
      state.userName = action.payload.userName
    },
    setHost(state, action: PayloadAction<{ hostUrl: string}>) {
      state.hostUrl = action.payload.hostUrl
    },
    clearHost(state) {
      state.hostUrl = null
    },
    clearCredentials(state) {
      state.apiKey = null
      state.userId = null
      state.userName = null
    },
  },
})

export const { setCredentials, clearCredentials, setHost, clearHost } = authSlice.actions
export default authSlice
