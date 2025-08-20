import { Text, View, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import "../global.css"

const CameraView = () => {
  const [isCameraReady, setIsCameraReady] = useState(true)

  const takePicture = async () => {
    Alert.alert('Cámara', 'Función de cámara en desarrollo')
  }

  const flipCamera = () => {
    Alert.alert('Cámara', 'Cambiar cámara en desarrollo')
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black font-bold text-lg">OutMind</Text>
        <View className="w-8 h-8 bg-gray-300 rounded-full">
          {/* Profile picture placeholder */}
        </View>
      </View>

      {/* Camera View */}
      <View className="flex-1 mx-4 mb-4">
        <View className="flex-1 bg-gray-600 rounded-lg overflow-hidden justify-center items-center">
          {/* Camera Placeholder */}
          <View className="items-center">
            <Ionicons name="camera" size={64} color="white" />
            <Text className="text-white text-lg mt-4">Vista de Cámara</Text>
            <Text className="text-white text-sm mt-2 text-center px-4">
              La funcionalidad de cámara estará disponible próximamente
            </Text>
          </View>

          {/* Camera Controls Overlay */}
          <View className="absolute bottom-8 left-0 right-0">
            <View className="flex-row justify-around items-center px-8">
              {/* Flip Camera Button */}
              <TouchableOpacity 
                onPress={flipCamera}
                className="w-12 h-12 bg-white bg-opacity-30 rounded-full items-center justify-center"
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>

              {/* Take Picture Button */}
              <TouchableOpacity 
                onPress={takePicture}
                className="w-16 h-16 bg-white rounded-full items-center justify-center border-4 border-gray-200"
              >
                <View className="w-12 h-12 bg-white rounded-full"></View>
              </TouchableOpacity>

              {/* Settings Button */}
              <TouchableOpacity 
                className="w-12 h-12 bg-white bg-opacity-30 rounded-full items-center justify-center"
              >
                <Ionicons name="settings" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
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
          
          <TouchableOpacity className="items-center py-2 px-3 rounded-lg">
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="camera" size={20} color="#3B82F6" />
            </View>
            <Text className="text-blue-600 text-xs font-medium">Cámara</Text>
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

export default CameraView
