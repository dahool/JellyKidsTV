import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, useWindowDimensions, LayoutChangeEvent } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useEvent } from 'expo'
import { Ionicons } from '@expo/vector-icons'
import { useGetUserLibraryQuery } from '~/services/api/playlist'
import { runOnJS, useDerivedValue, useSharedValue } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { JellyfinItem } from '~/services/api/types'
import { Animated } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '~/store'
import { endpoint } from '~/services/api'

const formatTime = (totalSec: number = 0) => {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = Math.floor(totalSec % 60)

    const hh = h.toString().padStart(2, '0')
    const mm = m.toString().padStart(2, '0')
    const ss = s.toString().padStart(2, '0')

    return h > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`
}

export default function VideoPlayer() {

    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()

    const { userId, apiKey, hostUrl } = useSelector((state: RootState) => state.auth)

    const { data, isLoading } = useGetUserLibraryQuery({ userId: userId! })
    const [showControls, setShowControls] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    //const seekPreview = useSharedValue<number | null>(null)
    const [seekPreview, setSeekPreview] = useState<number | null>(null)

    const { width, height } = useWindowDimensions()

    const playlist = data?.Items ?? []
    const index = playlist.findIndex((item) => item.Id === id)
    const current = playlist[index]
    const next = playlist[index + 1]
    const prev = playlist[index - 1]

    const videoUrl = useMemo(() => current
        ? endpoint.video(current.Id)
        : '',
        [current?.Id])

    const player = useVideoPlayer(videoUrl, (p) => {
        p.play()
        p.timeUpdateEventInterval = 1
        p.loop = false
    })

    const gesture = Gesture.Tap().onStart(() => {
        runOnJS(setShowControls)(true)
    })
    /* this is crashing and I don't know why, let's continue later
        const panGesture = Gesture.Pan()
            .onBegin(() => {
                seekPreview.value = player.currentTime
            })
            .onUpdate((e) => {
                if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
                    const delta = e.translationX / 10 // px per second
                    const preview = Math.min(
                        player.duration,
                        Math.max(0, player.currentTime + delta)
                    )
                    seekPreview.value = preview
                }
            })
            .onEnd(() => {
                if (seekPreview.value !== null) {
                    runOnJS(() => {
                        player.currentTime = seekPreview.value!
                        seekPreview.value = null
                    })()
                }
            })

        useDerivedValue(() => {
            if (seekPreview.value !== null) {
                runOnJS(seekBy)(seekPreview.value)
            }
        }, [seekPreview])

        const gesture = Gesture.Simultaneous(tapGesture, panGesture)
    */
    useEffect(() => {
        if (player.status === 'readyToPlay') {
            player.play()
            player.loop = false
        }
    }, [player.status])

    useEffect(() => {
        const subscription = player.addListener('playToEnd', () => {
            console.log("played to end")
            setCountdown(5)
        })
        return () => {
            subscription.remove()
        }
    }, [])

    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing })
    const { muted: isMuted } = useEvent(player, 'mutedChange', { muted: player.muted })
    const { currentTime } = useEvent(player, 'timeUpdate', {
        currentTime: player.currentTime,
        bufferedPosition: player.bufferedPosition,
        currentLiveTimestamp: player.currentLiveTimestamp,
        currentOffsetFromLive: player.currentOffsetFromLive
    })

    // Auto-hide controls
    useEffect(() => {
        if (showControls) {
            const timeout = setTimeout(() => setShowControls(false), 5000)
            return () => clearTimeout(timeout)
        }
    }, [showControls])

    useEffect(() => {
        if (countdown === null || countdown <= 0) return
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(timer)
                    replacePlayer(next)
                }
                return prev! - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [countdown, next])

    useEffect(() => {
        if (seekPreview === null) return
        const timer = setInterval(() => {
            clearInterval(timer)
            setSeekPreview(null)
        }, 3000)
        return () => clearInterval(timer)
    }, [seekPreview])

    const replacePlayer = useCallback(async (item: JellyfinItem) => {
        if (!item) return
        player.pause()
        router.replace(`/video/${item.Id}`)
    }, [player])

    const seekTo = (seconds: number) => {
        if (!player.currentTime || !player.duration || !seconds) return
        player.currentTime = seconds
        setSeekPreview(player.currentTime)
    }

    if (isLoading || !current || player.status === 'loading') {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#fff" />
                <Text className="text-white mt-4">Loading video...</Text>
            </View>
        )
    }

    return (
        <GestureDetector gesture={gesture}>
            <View className="flex-1 bg-black">

                <VideoView
                    player={player}
                    style={{ width, height }}
                    nativeControls={false}
                    allowsFullscreen
                    allowsPictureInPicture={false}
                    pointerEvents="box-none"
                />

                {showControls && (
                    <View className="absolute top-10 left-0 right-0 items-center px-4">
                        <Text
                            className="text-white text-xl font-semibold text-center"
                            style={{
                                textShadowColor: 'rgba(0, 0, 0, 0.6)',
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 4,
                            }}
                            numberOfLines={1}
                        >
                            {current.Name}
                        </Text>
                    </View>
                )}

                {/* Progress */}
                {!showControls &&
                    <SimpleProgressBar
                        currentTime={currentTime}
                        duration={player.duration}
                    />
                }

                {seekPreview !== null && (
                    <View className="absolute top-[50%] left-0 right-0 items-center">
                        <View className="bg-black/70 px-4 py-2 rounded-lg">
                            <Text className="text-white text-lg font-bold">
                                {formatTime(seekPreview)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Controls */}
                <Controls
                    currentTime={currentTime}
                    duration={player.duration}
                    isShown={showControls || !isPlaying}
                    isMuted={isMuted}
                    isPlaying={isPlaying}
                    onPlay={() => isPlaying ? player.pause() : player.play()}
                    onBack={() => router.back()}
                    onMute={() => player.muted = !isMuted}
                    onChange={(n) => n ? replacePlayer(next) : replacePlayer(prev)}
                    seekTo={seekTo}
                />

                {/* Countdown Overlay */}
                {countdown !== null && (
                    <View className="absolute inset-0 items-center justify-center bg-black/60">
                        <ActivityIndicator size="large" color="#fff" />
                        <Text className="text-white text-2xl mb-4">Next in {countdown}...</Text>
                        <TouchableOpacity
                            className="bg-white px-6 py-2 rounded-full"
                            hitSlop={10}
                            onPress={() => next && router.replace(`/video/${next.Id}`)}
                        >
                            <Text className="text-black font-bold">Play Next</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </GestureDetector>
    )
}

interface ControlsProp {
    isShown: boolean
    isMuted: boolean
    isPlaying: boolean
    currentTime: number
    duration: number
    onChange: (forward: boolean) => void
    onBack: () => void
    onPlay: () => void
    onMute: () => void
    seekTo: (seconds: number) => void
}

function SimpleProgressBar({ currentTime, duration }: { currentTime: number, duration: number }) {
    return (
        <View className="absolute bottom-0 left-0 right-0 h-2 justify-center bg-zinc-800">
            <View className="absolute h-2 left-0 right-0 bg-zinc-700 rounded-full" />
            <View
                className="h-full bg-red-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
            />
        </View>
    )
}

function Controls(props: ControlsProp) {

    const opacity = useRef(new Animated.Value(props.isShown ? 1 : 0)).current
    const barRef = useRef<View>(null)
    const [barWidth, setBarWidth] = useState(0)

    const handleSeek = (event: any) => {
        if (!barWidth || !props.duration || !isFinite(props.duration)) return
        const locationX = event.nativeEvent.locationX
        const ratio = locationX / barWidth
        if (!isFinite(ratio)) return
        const newTime = Math.floor(ratio * props.duration)
        props.seekTo(newTime)
    }

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: props.isShown ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }, [props.isShown])

    return (
        <>
            {props.isShown && (
                <>
                    {/* Back Button */}
                    <View className="absolute top-4 left-4 h-36 w-36">
                        <TouchableOpacity onPress={props.onBack} className='h-full w-full items-center justify-center' hitSlop={10}>
                            <Ionicons name="arrow-back" size={52} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Animated.View
                        pointerEvents={props.isShown ? 'auto' : 'none'}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 80,
                            alignItems: 'center',
                            opacity,
                        }}
                    >

                        <View className="w-full max-w-[700px] bg-black/50 px-6 py-4 rounded-xl backdrop-blur-md">

                            {/* Time + Progress Bar */}
                            <View className="mb-4 w-full">
                                <View className="flex-row justify-between mb-1 px-1">
                                    <Text className="text-white text-xs">
                                        {formatTime(props.currentTime)}
                                    </Text>
                                    <Text className="text-white text-xs">
                                        {formatTime(props.duration)}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPressIn={handleSeek}
                                    onLayout={(e: LayoutChangeEvent) => {
                                        setBarWidth(e.nativeEvent.layout.width)
                                    }}
                                >
                                    <View className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                        <View
                                            className="h-full bg-red-500"
                                            style={{ width: `${(props.currentTime / props.duration) * 100}%` }}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Playback Controls */}
                            <View className="w-full flex-row justify-center items-center gap-x-36">
                                <TouchableOpacity onPress={() => props.onChange(false)} className='p-4' hitSlop={10}>
                                    <Ionicons name="play-skip-back" size={36} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={props.onPlay} className='p-4' hitSlop={10}>
                                    <Ionicons
                                        name={props.isPlaying ? 'pause' : 'play'}
                                        size={48}
                                        color="white"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => props.onChange(true)} className='p-4' hitSlop={10}>
                                    <Ionicons name="play-skip-forward" size={36} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={props.onMute} className='p-4' hitSlop={15}>
                                    <Ionicons
                                        name={props.isMuted ? 'volume-mute' : 'volume-high'}
                                        size={24}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>


                    </Animated.View>
                </>
            )}
        </>
    )
}