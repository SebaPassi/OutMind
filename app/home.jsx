import { Text, View, Image, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '../src/supabaseClient'
import "../global.css"

const Home = () => {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadProfiles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading profiles:', error)
        Alert.alert('Error', 'No se pudieron cargar los perfiles')
        return
      }

      setProfiles(data || [])
    } catch (error) {
      console.error('Error loading profiles:', error)
      Alert.alert('Error', 'Ocurrió un error al cargar los perfiles')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      loadProfiles()
    }, [])
  )

  useEffect(() => {
    loadProfiles()
  }, [])

  const filteredProfiles = profiles.filter(profile =>
    profile.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-700"
            placeholderTextColor="gray"
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4">
        {/* User Profiles Grid */}
        {loading ? (
          <View className="items-center py-8">
            <View className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <Text className="text-gray-500 mt-2">Cargando perfiles...</Text>
          </View>
        ) : filteredProfiles.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {filteredProfiles.map((profile) => (
              <TouchableOpacity 
                key={profile.id} 
                className="w-[48%] bg-blue-100 rounded-lg p-3 mb-4"
                onPress={() => router.push({ 
                  pathname: '/profile', 
                  params: { profileId: profile.id } 
                })}
              >
                <View className="bg-blue-200 rounded-lg p-4 mb-2 items-center justify-center">
                  {profile.profile_picture ? (
                    <Image 
                      source={{ uri: profile.profile_picture }} 
                      className="w-full h-24 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-24 bg-gray-300 rounded-lg items-center justify-center">
                      <Ionicons name="person" size={32} color="gray" />
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 text-sm">{profile.age} años</Text>
                <Text className="font-bold text-gray-800">{profile.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center py-8">
            <Ionicons name="people" size={48} color="gray" />
            <Text className="text-gray-500 mt-2 text-center">
              {searchQuery ? 'No se encontraron perfiles que coincidan con tu búsqueda' : 'No hay perfiles agregados aún'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                className="mt-4 bg-blue-600 px-6 py-2 rounded-lg"
                onPress={() => router.push('/add-person')}
              >
                <Text className="text-white font-medium">Agregar primer perfil</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Add Profile Button */}
        <TouchableOpacity 
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 flex-row items-center justify-center"
          onPress={() => router.push('/add-person')}
        >
          <Ionicons name="add-circle" size={24} color="#3B82F6" />
          <Text className="text-gray-500 ml-2 font-medium">Agregar perfil</Text>
        </TouchableOpacity>

        {/* Contact Us Button */}
        <TouchableOpacity 
          className="bg-gray-100 rounded-lg p-4 mb-4 flex-row items-center justify-center"
          onPress={() => router.push('/contact')}
        >
          <Ionicons name="mail" size={24} color="#6B7280" />
          <Text className="text-gray-600 ml-2 font-medium">Contact Us</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="bg-white border-t border-gray-200 px-6 py-3">
        <View className="flex-row justify-around items-center">
          <TouchableOpacity className="items-center py-2 px-3 rounded-lg">
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="home" size={20} color="#3B82F6" />
            </View>
            <Text className="text-blue-600 text-xs font-medium">Inicio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center py-2 px-3 rounded-lg" 
            onPress={() => router.push('/calendar')}
          >
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="calendar" size={20} color="#6B7280" />
            </View>
            <Text className="text-gray-500 text-xs font-medium">Calendario</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center py-2 px-3 rounded-lg" 
            onPress={() => router.push('/camera')}
          >
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="camera" size={20} color="#6B7280" />
            </View>
            <Text className="text-gray-500 text-xs font-medium">Cámara</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center py-2 px-3 rounded-lg" 
            onPress={() => router.push('/about')}
          >
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="information-circle" size={20} color="#6B7280" />
            </View>
            <Text className="text-gray-500 text-xs font-medium">Acerca de</Text>
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
