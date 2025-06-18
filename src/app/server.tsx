import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native'
import { discoverServers, DiscoveryInfo } from '../services/discovery'
import { useLazyGetServerInfoQuery } from '../services/api/server'
import { router } from 'expo-router'
import { ActivityIndicator } from 'react-native'
import { useSaveHost } from '../auth/hooks/auth'
import { getHost } from '../auth'

export default function ServerDiscoveryScreen() {
  const [url, setUrl] = useState('')
  const [servers, setServers] = useState<DiscoveryInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [isValidUrl, setIsValidUrl] = useState(true)

  const [triggerGetServerInfo, { data, isLoading, error }] = useLazyGetServerInfoQuery()
  const [isConnecting, setIsConnecting] = useState(false)
  const saveHost = useSaveHost()
  
  useEffect(() => {
    const scan = async () => {
      setLoading(true)
      console.log("Start discover")
      const discovered = await discoverServers()
      console.log("End discover")
      setServers(discovered)
      setLoading(false)
    }
    const getHostUrl = async () => {
      const h = await getHost()
      if (h) setUrl(h);
    }
    getHostUrl()
    scan()
  }, [])

  const validateUrl = (value: string) => {
    setUrl(value)
    const regex = /(https?:\/\/)([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)(:\d+)?(\/\S*)?/g
    setIsValidUrl(regex.test(value.trim()))
  }

  const handleConnect = async () => {
    console.log('Connecting to:', url)
    setIsConnecting(true)
    saveHost(url)
    try {
      const server = await triggerGetServerInfo({ baseUrl: url }).unwrap()
      console.log('Server', server)
      router.replace('/login')
    } catch (err) {
      saveHost(null)
      console.error(err)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <>
      {isConnecting && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="mt-2 text-white text-sm">Connecting…</Text>
        </View>
      )}
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-zinc-900 px-4 py-8">
        {/* Card container */}
        <View className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-md p-6">
          {/* Title */}
          <Text className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-6">
            Connect to Server
          </Text>

          {/* Input */}
          <View className="mb-4">
            <TextInput
              value={url}
              onChangeText={validateUrl}
              placeholder="https://your-server.com"
              placeholderTextColor="#aaa"
              className={`px-4 py-3 rounded-lg text-base border ${isValidUrl ? 'border-zinc-300' : 'border-red-500'
                } text-black dark:text-white bg-white dark:bg-zinc-700`}
            />
            {!isValidUrl && (
              <Text className="text-red-500 text-xs mt-1 ml-1">Please enter a valid URL</Text>
            )}
          </View>

          {/* Connect Button */}
          <TouchableOpacity
            onPress={handleConnect}
            disabled={!url || !isValidUrl}
            className={`rounded-lg px-5 py-3 mb-6 ${!url || !isValidUrl
              ? 'bg-zinc-300 dark:bg-zinc-700'
              : 'bg-zinc-800 dark:bg-zinc-200'
              }`}
          >
            <Text
              className={`text-center font-medium ${!url || !isValidUrl ? 'text-zinc-500' : 'text-white dark:text-black'
                }`}
            >
              Connect
            </Text>
          </TouchableOpacity>

          {/* Discovered Servers Header */}
          <Text className="text-lg font-medium text-zinc-700 dark:text-zinc-100 mb-3">
            Discovered Servers
          </Text>

          {/* Server List */}
          {loading ? (
            <Text className="text-zinc-500 dark:text-zinc-400">Scanning the network…</Text>
          ) : (
            <ScrollView className="space-y-3 max-h-60">
              {servers.map((server, index) => (
                <TouchableOpacity
                  key={`${server.address}-${index}`}
                  onPress={() => {
                    setUrl(server.address)
                    handleConnect()
                  }}
                  className="bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg px-4 py-3"
                >
                  <Text className="text-base font-semibold text-zinc-800 dark:text-white">
                    {server.name}
                  </Text>
                  <Text className="text-sm text-zinc-500 dark:text-zinc-300">{server.address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </>
  )
}