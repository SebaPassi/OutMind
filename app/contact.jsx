import { Text, View, TouchableOpacity, Linking, Alert } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import "../global.css"

const Contact = () => {
  const contacts = [
    {
      name: 'Sofía Larraín',
      email: 'sofialarrainv@uc.cl',
      role: 'Desarrolladora'
    },
    {
      name: 'Sebastian Passi',
      email: 'sebastian.passim@uc.cl',
      role: 'Desarrollador'
    }
  ]

  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de correo')
    })
  }

  const handleBackPress = () => {
    router.back()
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black font-bold text-lg">Contacto</Text>
        <View className="w-6" />
      </View>

      {/* Content */}
      <View className="flex-1 px-4">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="people" size={40} color="#3B82F6" />
          </View>
          <Text className="text-black font-bold text-xl text-center mb-2">Equipo de Desarrollo</Text>
          <Text className="text-gray-600 text-center">
            ¿Tienes alguna pregunta o sugerencia? No dudes en contactarnos.
          </Text>
        </View>

        {/* Contact Cards */}
        <View className="space-y-4">
          {contacts.map((contact, index) => (
            <View key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <Ionicons name="person" size={24} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-black font-semibold text-lg">{contact.name}</Text>
                  <Text className="text-gray-600 text-sm">{contact.role}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={() => handleEmailPress(contact.email)}
                className="flex-row items-center bg-white border border-gray-200 rounded-lg p-3"
              >
                <Ionicons name="mail" size={20} color="#3B82F6" />
                <Text className="text-blue-600 font-medium ml-3 flex-1">{contact.email}</Text>
                <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Additional Info */}
        <View className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-blue-800 font-semibold ml-2">Información</Text>
          </View>
          <Text className="text-blue-700 text-sm">
            Esta aplicación fue desarrollada como parte del proyecto OutMind para la gestión de tareas y recordatorios.
          </Text>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View className="bg-white border-t border-gray-200 px-6 py-3">
        <View className="flex-row justify-around items-center">
          <TouchableOpacity 
            className="items-center py-2 px-3 rounded-lg" 
            onPress={() => router.push('/home')}
          >
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="home" size={20} color="#6B7280" />
            </View>
            <Text className="text-gray-500 text-xs font-medium">Inicio</Text>
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

export default Contact
