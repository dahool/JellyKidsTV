import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'

export const getDeviceDetails = async () => {
  if (Platform.OS === 'web') {
    return {
      'deviceName': 'Web',
      'deviceId': 'TEST'
    }
  }
  const [ deviceName, deviceId ] = await Promise.all([
    DeviceInfo.getDeviceName(),
    DeviceInfo.getUniqueId()
  ])
  return {
    'deviceName': deviceName,
    'deviceId': deviceId
  }
}