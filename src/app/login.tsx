import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useGetServerInfoQuery } from '../services/api/server'
import { useLoginMutation } from '../auth/service'
import { router } from 'expo-router'
import { getDeviceDetails } from '../utils'
import { useDispatch } from 'react-redux'
import { setDeviceInfo } from '../auth/slice/device'

export default function ServerDiscoveryScreen() {

  const [username, setUsername] = useState<string>()
  const [password, setPassword] = useState<string>()

  const { data: serverInfo } = useGetServerInfoQuery()
  const [triggerLogin, { data, error, isLoading }] = useLoginMutation()

  const dispatch = useDispatch()

  useEffect(() => {
    const updateDeviceDetails = async () => {
      const device = await getDeviceDetails()
      dispatch(setDeviceInfo({deviceName: device.deviceName, deviceId: device.deviceId}))
    }
    updateDeviceDetails()
  }, [])

  const handleLogin = async () => {
    console.log('Login', username)
    if (username && password) {
      try {
        await triggerLogin({ username, password }).unwrap()
        router.replace('/')
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleQuickConnect = async () => {
    console.log('Quick connect:')
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-zinc-900 px-4 py-8">
      {/* Card container */}
      <View className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-md p-6">

        {/* Title */}
        <Text className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-6">
          Sign In
        </Text>

        {/* Username */}
        <View className="mb-4">
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            className="px-4 py-3 rounded-lg text-base border border-zinc-300 dark:border-zinc-600 text-black dark:text-white bg-white dark:bg-zinc-700"
          />
        </View>

        {/* Password */}
        <View className="mb-6">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            className="px-4 py-3 rounded-lg text-base border border-zinc-300 dark:border-zinc-600 text-black dark:text-white bg-white dark:bg-zinc-700"
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={!username || !password}
          className={`rounded-lg px-5 py-3 mb-4 ${!username || !password
              ? 'bg-zinc-300 dark:bg-zinc-700'
              : 'bg-zinc-800 dark:bg-zinc-200'
            }`}
        >
          <Text
            className={`text-center font-medium ${!username || !password ? 'text-zinc-500' : 'text-white dark:text-black'
              }`}
          >
            Sign In
          </Text>
        </TouchableOpacity>

        {/* Use Quick Connect Button */}
        <TouchableOpacity
          onPress={handleQuickConnect}
          className="rounded-lg px-5 py-3 mb-6 bg-zinc-200 dark:bg-zinc-700"
        >
          <Text className="text-center font-medium text-zinc-700 dark:text-white">
            Use Quick Connect
          </Text>
        </TouchableOpacity>

        {/* Server Name Footer */}
        {serverInfo &&
        <Text className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Connected to: {serverInfo?.ServerName}
        </Text>
         }
      </View>
    </View>
  )
}