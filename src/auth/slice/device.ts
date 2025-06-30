import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DeviceInfo } from './types'

const initialState: DeviceInfo = {
  deviceName: null,
  deviceId: null
}

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDeviceInfo(state, action: PayloadAction<{ deviceName: string; deviceId: string }>) {
      state.deviceId = action.payload.deviceId
      state.deviceName = action.payload.deviceName
    },
  },
})

export const { setDeviceInfo } = deviceSlice.actions
export default deviceSlice
