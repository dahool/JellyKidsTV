import { useEffect } from 'react'
import * as Device from 'expo-device'
import uuid from 'react-native-uuid'
import { getSecureValue, saveSecureValue } from '../storage'
import { useDispatch } from 'react-redux'
import { setDeviceInfo } from '../slice/device'
import { Platform } from 'react-native'

export const useDeviceInfo = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        const deviceName = Platform.OS === 'web' ? 'Web' : Device.deviceName || Device.modelName || 'Unknown Device'

        const key = 'device-id'
        let id = await getSecureValue(key)

        if (!id) {
          id = uuid.v4()
          await saveSecureValue(key, id)
        }

        dispatch(setDeviceInfo({deviceName: deviceName, deviceId: id }))
      } catch (err) {
        console.error('Error fetching device info:', err)
      }
    }
    loadDeviceInfo()
  }, [])

}