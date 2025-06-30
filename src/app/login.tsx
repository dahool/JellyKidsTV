import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'
import { useGetServerInfoQuery } from '../services/api/server'
import { router } from 'expo-router'
import { useAuthenticateWithQuickConnect, useInitiateQuickConnect, useLogin } from '../auth/hooks/loginHook'
import { ActivityIndicator } from 'react-native'

export default function LoginScreen() {

  const [username, setUsername] = useState<string>()
  const [password, setPassword] = useState<string>()
  const [qcCode, setQcCode] = useState<string | null>(null)

  const { data: serverInfo } = useGetServerInfoQuery()
  const { login: triggerLogin, loading, error } = useLogin()
  const { initiateQuickConnect } = useInitiateQuickConnect()
  const { authenticateWithQuickConnect, cancelQuickConnect, loading: qcLoading, error: qcError } = useAuthenticateWithQuickConnect()

  const handleLogin = async () => {
    console.log('Login', username)
    if (username && password) {
      try {
        await triggerLogin({ username, password })
        router.replace('/')
      } catch (err: any) {
        console.error(err)
      }
    }
  }

  const handleQuickConnect = async () => {
    console.log('Quick connect')
    try {
      const state = await initiateQuickConnect()
      setQcCode(state.Code)
      const auth = await authenticateWithQuickConnect(state)
      if (auth) router.replace('/')
    } catch (err: any) {
      console.error(err)
    } finally {
      setQcCode(null)
    }
  }

  return (
    <>
      {qcCode &&
        <QuickConnectDialog qcCode={qcCode} onCancel={() => {
          setQcCode(null)
          cancelQuickConnect()
        }} />
      }
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

          {/* Error Message */}
          {error || qcError && (
            <View className="mb-4 bg-red-100 dark:bg-red-800 rounded-md px-4 py-2">
              <Text className="text-sm text-red-800 dark:text-red-200 text-center">
                {error || qcError}
              </Text>
            </View>
          )}

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || !username || !password}
            className={`rounded-lg px-5 py-3 mb-4 ${!username || !password
              ? 'bg-zinc-300 dark:bg-zinc-700'
              : 'bg-zinc-800 dark:bg-zinc-200'
              }`}>
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#666" />
                <Text className="ml-2 font-medium text-zinc-500">Signing in...</Text>
              </>
            ) : (
              <Text
                className={`text-center font-medium ${!username || !password ? 'text-zinc-500' : 'text-white dark:text-black'
                  }`}
              >
                Sign In
              </Text>
            )}
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

          <TouchableOpacity
            onPress={() => router.replace('/server')}
            className="rounded-lg px-5 py-3 mb-6 bg-zinc-200 dark:bg-zinc-700"
          >
            <Text className="text-center font-medium text-zinc-700 dark:text-white">
              Change Server
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

interface QuickConnectDialogProps {
  qcCode: string | null
  onCancel: () => void
}

const QuickConnectDialog: React.FC<QuickConnectDialogProps> = ({ qcCode, onCancel }) => {
  const [secondsLeft, setSecondsLeft] = useState(60)

  useEffect(() => {
    if (!qcCode) return

    setSecondsLeft(60) // Reset timer every time qcCode changes

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onCancel() // Auto-cancel when countdown ends
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [qcCode, onCancel])

  if (!qcCode) return null

  return (
    <Modal
      animationType="fade"
      transparent
      visible={!!qcCode}
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-11/12 max-w-md shadow-xl items-center">
          <Text className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
            Quick Connect
          </Text>
          <Text className="mb-4 text-zinc-600 dark:text-zinc-300 text-center">
            Enter code{' '}
            <Text className="font-mono text-lg text-blue-600 dark:text-blue-400">
              {qcCode}
            </Text>{' '}
            to login.
          </Text>
          <Text className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Expires in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            onPress={onCancel}
            className="px-4 py-2 rounded-lg bg-red-500 active:bg-red-600"
          >
            <Text className="text-white font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}