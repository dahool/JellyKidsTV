import { useState, useEffect } from 'react'
import { getAuth, getHost } from '@/src/auth/storage'

export const useSession = () => {
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [hostUrl, setHostUrl] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [key, id] = await getAuth()
        const host = await getHost()
        setApiKey(key)
        setUserId(id)
        setHostUrl(host)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return {
    loading,
    authenticated: !!(apiKey && userId && hostUrl),
    credentials: { apiKey, userId, hostUrl },
  }
}