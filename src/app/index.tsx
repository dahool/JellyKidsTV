import MediaGallery from "@/src/components/gallery"
import { useSession } from '~/auth/hooks/useSession'
import { useEffect } from 'react'
import { useRouter } from 'expo-router'

export default function Index() {

  const router = useRouter()
  const { loading, authenticated, credentials } = useSession()

  useEffect(() => {
    console.log(credentials)
    if (!loading && !authenticated) {
      if (credentials.hostUrl) {
        router.replace('/login')
      } else {
        router.replace('/server')
      }
    }
  }, [ loading ])

  if (!authenticated) return null

  return (
    <>
      <MediaGallery />
    </>
  )

}
