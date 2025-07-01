import { useState, useEffect, useRef, useCallback } from 'react';
import dgram from 'react-native-udp';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

export type DiscoveryInfo = {
  name: string;
  address: string;
};

const DISCOVERY_PORT = 7359;
const DISCOVERY_MESSAGE = 'Who is JellyfinServer?';
const SOCKET_TIMEOUT = 5000; // How long to listen for responses
const MAX_RESULTS = 25; // Max number of unique servers to find

type DiscoveryResult = {
  servers: DiscoveryInfo[];
  loading: boolean;
  error: Error | null;
  discover: () => void;
};

export const useServerDiscovery = (): DiscoveryResult => {
  
  const [servers, setServers] = useState<DiscoveryInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to clean up the socket and timeout
  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      console.log('UDP socket closed by cleanup.');
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const discover = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.warn('Jellyfin server discovery via UDP is not supported on web platform.');
      setServers([]);
      setLoading(false);
      setError(new Error('UDP discovery not supported on web.'));
      return;
    }

    setLoading(true);
    setServers([]);
    setError(null);
    cleanup(); 

    let broadcastAddress: string | null = null;

    try {
      const ipAddress = await Network.getIpAddressAsync();
      if (ipAddress) {
        const lastDotIndex = ipAddress.lastIndexOf('.');
        if (lastDotIndex !== -1) {
          broadcastAddress = ipAddress.substring(0, lastDotIndex) + '.255';
        }
      }
    } catch (err) {
      console.error("Failed to get IP address or derive broadcast address:", err);
      setLoading(false);
      setError(err as Error);
      return;
    }

    if (broadcastAddress == null) {
      const err = new Error("Could not determine broadcast address. Check network configuration.");
      console.error(err.message);
      setLoading(false);
      setError(err);
      return;
    }

    try {
      const socket = dgram.createSocket({ type: 'udp4' });
      socketRef.current = socket; // Store socket in ref

      socket.on('error', (err) => {
        console.error('UDP socket error:', err);
        setError(err);
        setLoading(false);
        cleanup();
      });

      socket.on('close', () => {
        console.log('UDP socket officially closed.');
      });

      socket.on('message', (msg, rinfo) => {
        try {
          const json = JSON.parse(msg.toString());
          const info: DiscoveryInfo = {
            name: json.Name,
            address: json.Address,
          };

          setServers((prevServers) => {
            if (!prevServers.some((s) => s.address === info.address)) {
              const newServers = [...prevServers, info];
              if (newServers.length >= MAX_RESULTS) {
                console.log(`Max results (${MAX_RESULTS}) reached. Closing socket.`);
                cleanup(); // Close socket and clear timeout
                setLoading(false);
              }
              return newServers;
            }
            return prevServers;
          });
        } catch (err) {
          console.warn('Failed to parse message from:', rinfo.address, err);
        }
      });

      socket.bind(0, undefined, () => {
        socket.setBroadcast(true);

        socket.send(
          Buffer.from(DISCOVERY_MESSAGE),
          0,
          DISCOVERY_MESSAGE.length,
          DISCOVERY_PORT,
          broadcastAddress!,
          (err) => {
            if (err) {
              console.error('Failed to send discovery message:', err);
              setError(err);
              setLoading(false);
              cleanup();
            } else {
              console.log(`Sent discovery message to ${broadcastAddress}:${DISCOVERY_PORT}`);
            }
          }
        );
      });

      // Set timeout to close socket and resolve results after a period
      timeoutRef.current = setTimeout(() => {
        console.log('Discovery timeout reached.');
        cleanup(); // Close socket and clear timeout
        setLoading(false);
      }, SOCKET_TIMEOUT);

    } catch (err) {
      console.error('Error creating or binding UDP socket:', err);
      setError(err as Error);
      setLoading(false);
      cleanup();
    }
  }, [cleanup]); // `cleanup` is a dependency as it's a memoized function

  useEffect(() => {
    discover();
    return () => {
      console.log('Component unmounted, running cleanup.');
      cleanup();
    };
  }, [cleanup]);

  return { servers, loading, error, discover };
};