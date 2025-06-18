import dgram from 'react-native-udp'
import { NetworkInfo } from 'react-native-network-info'
import { Platform } from 'react-native'

export type DiscoveryInfo = {
  name: string
  address: string
}

const DISCOVERY_PORT = 7359
const DISCOVERY_MESSAGE = 'Who is JellyfinServer?'
const SOCKET_TIMEOUT = 5000
const MAX_RESULTS = 25

export const discoverServers = async (): Promise<DiscoveryInfo[]> => {

  if (Platform.OS === 'web') return []

  const broadcastAddress = await NetworkInfo.getBroadcast();

  if (broadcastAddress == null) {
    console.error("Invalid brodcast address")
    return []
  }

  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket({ type: 'udp4' })
    const results: DiscoveryInfo[] = []

    socket.bind(0, undefined, () => {
      socket.setBroadcast(true)

      socket.send(
        Buffer.from(DISCOVERY_MESSAGE),
        0,
        DISCOVERY_MESSAGE.length,
        DISCOVERY_PORT,
        broadcastAddress,
        (err) => {
          if (err) return reject(err)
        }
      )
    })

    socket.on('message', (msg, rinfo) => {
      try {
        const json = JSON.parse(msg.toString())
        const info: DiscoveryInfo = {
          name: json.Name,
          address: json.Address,
        }

        if (!results.some((s) => s.address === info.address)) {
          results.push(info)
        }

        if (results.length >= MAX_RESULTS) {
          socket.close()
          resolve(results)
        }
      } catch (err) {
        console.warn('Failed to parse message:', err)
        reject(err)
      }
    })

    // Timeout
    setTimeout(() => {
      socket.close()
      resolve(results)
    }, SOCKET_TIMEOUT)
  })
}