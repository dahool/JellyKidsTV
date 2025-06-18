import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { clearCredentials, clearHost, setHost } from '../slice/auth'
import { authApi } from '../service'
import { collectionApi } from '@/src/services/api'
import { clearAuthStorage, saveHost } from '../storage'

export const useClearAuth = () => {
  const dispatch = useDispatch()

  const clearAuth = useCallback(async () => {
    dispatch(clearCredentials())
    dispatch(authApi.util.resetApiState())
    dispatch(collectionApi.util.resetApiState())
    await clearAuthStorage();
  }, [dispatch])

  return clearAuth
}

export const useSaveHost = () => {
  const dispatch = useDispatch()

  const saveHostCallback = useCallback(async (hostUrl: string | null) => {
    await saveHost(hostUrl)
    if (!hostUrl) {
      dispatch(clearHost())
    } else {
      dispatch(setHost({ hostUrl }))
    }
  }, [dispatch])

  return saveHostCallback
}
