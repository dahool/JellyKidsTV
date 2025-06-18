import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import { Ionicons } from "@expo/vector-icons";

const collections = ["Home", "Explore", "Favorites", "Settings"];

export default function NavMenu() {

  const [selected, setSelected] = useState("Home");

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Top Navbar */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-900 shadow-md">
        {/* Centered Collection Buttons */}
        <View className="flex-row flex-1 justify-center space-x-4">
          {collections.map((item) => (
            <Pressable
              key={item}
              onPress={() => setSelected(item)}
              className={`px-3 py-1 rounded-full ${
                selected === item
                  ? "bg-blue-600 dark:bg-blue-400"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm ${
                  selected === item
                    ? "text-white"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Profile Menu */}
        <Menu>
          <MenuTrigger>
            <Ionicons name="person-circle-outline" size={28} color="gray" />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => console.log("Sign out")}>
              <Text className="text-red-500">Sign Out</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      {/* Screen Content */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-gray-800 dark:text-gray-100">
          Selected: {selected}
        </Text>
      </View>
    </View>
  );
}