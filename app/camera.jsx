import { Text, View, TouchableOpacity, Alert, Modal } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import "../global.css"

const CameraView = () => {
  const [recognizedPerson, setRecognizedPerson] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const takePicture = async () => {
    // Simular reconocimiento para demostración
    setRecognizedPerson({
      profileId: 'demo-1',
      name: 'Demo Person',
      confidence: 95.5
    })
    setShowResult(true)
  }

  const flipCamera = () => {
    Alert.alert('Cámara', 'Cambiar cámara en desarrollo')
  }

  const closeResult = () => {
    setShowResult(false)
    setRecognizedPerson(null)
  }

  const goToProfile = () => {
    if (recognizedPerson) {
      closeResult()
      router.push({
        pathname: '/profile',
        params: { profileId: recognizedPerson.profileId }
      })
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-black">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Reconocimiento Facial</Text>
        <View className="w-8 h-8" />
      </View>

      {/* Camera View */}
      <View className="flex-1 mx-4 mb-4">
        <View className="flex-1 bg-gray-600 rounded-lg overflow-hidden justify-center items-center">
          {/* Camera Placeholder */}
          <View className="items-center">
            <Ionicons name="camera" size={64} color="white" />
            <Text className="text-white text-lg mt-4">Vista de Cámara</Text>
            <Text className="text-white text-sm mt-2 text-center px-4">
              Configurando reconocimiento facial...
            </Text>
            <TouchableOpacity 
              onPress={takePicture}
              className="mt-4 bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Probar Reconocimiento</Text>
            </TouchableOpacity>
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
                className="w-16 h-16 rounded-full items-center justify-center border-4 bg-white border-gray-200"
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

      {/* Recognition Result Modal */}
      <Modal
        visible={showResult}
        transparent={true}
        animationType="slide"
        onRequestClose={closeResult}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text className="text-xl font-bold text-gray-800 mt-2">
                ¡Persona Reconocida!
              </Text>
            </View>

            {recognizedPerson && (
              <View className="items-center mb-6">
                <Text className="text-2xl font-bold text-gray-800">
                  {recognizedPerson.name}
                </Text>
                <Text className="text-gray-600 mt-1">
                  Confianza: {recognizedPerson.confidence.toFixed(1)}%
                </Text>
              </View>
            )}

            <View className="space-y-3">
              <TouchableOpacity
                onPress={goToProfile}
                className="bg-blue-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold text-lg">
                  Ver Perfil
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={closeResult}
                className="bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="text-gray-700 font-semibold">
                  Continuar Escaneando
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    </SafeAreaView>
  )
}

export default CameraView
