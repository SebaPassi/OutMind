import { Text, View, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import "../global.css"

const Home = () => {
  const profiles = [
    { id: 1, name: 'Martin', age: 12, image: null },
    { id: 2, name: 'María', age: 42, image: null },
    { id: 3, name: 'Matias', age: 15, image: null },
    { id: 4, name: 'Manuel', age: 45, image: null },
  ]

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black font-bold text-lg">OutMind</Text>
        <View className="w-8 h-8 bg-gray-300 rounded-full">
          {/* Profile picture placeholder */}
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput 
            placeholder="Buscar..." 
            className="flex-1 ml-2 text-gray-700"
            placeholderTextColor="gray"
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4">
        {/* User Profiles Grid */}
        <View className="flex-row flex-wrap justify-between">
          {profiles.map((profile) => (
            <TouchableOpacity 
              key={profile.id} 
              className="w-[48%] bg-blue-100 rounded-lg p-3 mb-4"
              onPress={() => router.push('/profile')}
            >
              <View className="bg-blue-200 rounded-lg p-4 mb-2 items-center justify-center">
                {profile.image ? (
                  <Image source={{ uri: profile.image }} className="w-16 h-16 rounded-full" />
                ) : (
                  <View className="w-16 h-16 bg-gray-300 rounded-full items-center justify-center">
                    <Ionicons name="person" size={32} color="gray" />
                  </View>
                )}
              </View>
              <Text className="text-gray-600 text-sm">{profile.age} años</Text>
              <Text className="font-bold text-gray-800">{profile.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Profile Button */}
        <TouchableOpacity 
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 flex-row items-center justify-center"
          onPress={() => router.push('/add-person')}
        >
          <Ionicons name="add-circle" size={24} color="#3B82F6" />
          <Text className="text-gray-500 ml-2 font-medium">Agregar perfil</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="bg-white border-t border-gray-200 px-4 py-2">
        <View className="flex-row justify-around items-center">
          <TouchableOpacity className="items-center py-2">
            <Ionicons name="home" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-2" onPress={() => router.push('/calendar')}>
            <Ionicons name="grid" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-2" onPress={() => router.push('/camera')}>
            <Ionicons name="camera" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* iOS Home Indicator */}
      <View className="bg-white h-1">
        <View className="w-32 h-1 bg-gray-300 rounded-full mx-auto"></View>
      </View>
    </View>
  )
}

export default Home
