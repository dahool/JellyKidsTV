import { useMemo } from 'react'
import { View, Text, Image, FlatList, Pressable, useWindowDimensions, ActivityIndicator, TouchableOpacity } from "react-native"
import { useGetUserLibraryQuery } from '~/services/api/playlist'
import { Link } from 'expo-router'
import '@/global.css'
import { useSelector } from 'react-redux'
import { RootState } from '@/src/store'
import { endpoint } from '~/services/api'

export default function MediaGallery() {

    const { userId, hostUrl } = useSelector((state: RootState) => state.auth)

    const {
        data: cardsData,
        isLoading,     // True on initial load and when refetching without existing data
        isFetching,    // True whenever a request is in flight (initial, refetch, background)
        isSuccess,     // True if the query was successful and data is available
        isError,       // True if the query resulted in an error
    } = useGetUserLibraryQuery({ userId: userId! })

    const { width } = useWindowDimensions()

    const CARD_MIN_WIDTH = 250
    const CARD_GAP = 15

    const cardsPerRow = Math.floor((width) / (CARD_MIN_WIDTH))
    const cardWidth = useMemo(() => {
        return (width - CARD_GAP * (cardsPerRow + 1)) / cardsPerRow
    }, [width])

    if (isLoading || !cardsData) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-black">
                <ActivityIndicator size="large" color="#4B5563" />
                <Text className="mt-4 text-gray-700 dark:text-gray-300">Loading library...</Text>
            </View>
        )
    }

    return (
        <View className="min-h-screen p-4 font-sans flex-1">
            {/* Page Title
            <View className="items-center mb-6">
                <Text className="text-4xl font-extrabold text-gray-800 tracking-tight leading-tight text-center">
                    Ipsum
                </Text>
                <Text className="text-lg text-gray-600 mt-2 text-center">
                    Lorem
                </Text>
            </View>
                */}
            {/* Scrollable content */}
            <FlatList
                key={cardsPerRow}
                data={cardsData!.Items}
                keyExtractor={(item) => item.Id}
                numColumns={cardsPerRow}
                renderItem={({ item }) => (
                    <View style={{ width: cardWidth }}>
                    <Card
                        id={item.Id}
                        imageUrl={endpoint.primaryThumb(item.Id)}
                        title={item.Name}
                    />
                    </View>
                )}
                contentContainerStyle={{ padding: 16 }}
                {...(cardsPerRow > 1 && {
                    columnWrapperStyle: { justifyContent: 'center', gap: 8 }
                })}
            />
        </View>
    )
}

const Card = ({ id, imageUrl, title }: { id: string, imageUrl: string; title: string }) => {
    return (
        <Link href={{ pathname: '/video/[id]', params: { id: id } }} asChild>
            <TouchableOpacity className="bg-white dark:bg-gray-800 rounded-xl mb-4 overflow-hidden h-[330px] max-h-[330px]">
                <View className="p-2">
                    <Image
                        source={{ uri: imageUrl, cache: 'reload' }}
                        className="h-48 rounded-t-xl"
                        resizeMode="cover"
                        style={{ width: "100%" }}
                    />
                </View>
                <View className="p-4 pt-3">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                        {title}
                    </Text>
                </View>
            </TouchableOpacity>
        </Link>
    )
}