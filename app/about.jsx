import { Text, View, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import Logo from "../assets/OutMind_Logo.png"

const About = () => {
  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <ScrollView className="flex-1 px-6">
        <View className="items-center justify-start pt-16 pb-8">
          
          {/* Header Section */}
          <View className="items-center mb-6">
            <Image source={Logo} className="my-5 w-32 h-32 rounded-full items-center justify-center" />
            <Text className="font-bold text-2xl text-gray-800">Acerca de OutMind</Text>
          </View>

          {/* Main Description */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <Text className="text-center text-base leading-6 text-gray-700 mb-4">
              OutMind es un sistema de recordatorios inteligente diseñado para apoyar tu memoria, no distraerte de ella.
            </Text>
            <Text className="text-center text-base leading-6 text-gray-700">
              Al combinar reconocimiento facial, retroalimentación de voz y programación inteligente, <Text className="font-bold">OutMind</Text> transforma una puerta ordinaria en un asistente fluido que te ayuda a recordar lo que importa, justo cuando importa.
            </Text>
          </View>

          {/* Features Section */}
          <View className="w-full mb-6">
            <Text className="font-semibold text-lg text-gray-800 mb-4 text-center">Cómo Funciona</Text>
            
            <View className="space-y-3">
              <View className="bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100 mb-4">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-green-600 text-lg">👤</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">Reconocimiento Facial</Text>
                  <Text className="text-sm text-gray-600">Identifica a cada persona automáticamente</Text>
                </View>
              </View>

              <View className="bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100 mb-4">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-blue-600 text-lg">🎵</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">Retroalimentación de Voz</Text>
                  <Text className="text-sm text-gray-600">Entrega recordatorios personalizados</Text>
                </View>
              </View>

              <View className="bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-purple-600 text-lg">⏰</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">Programación Inteligente</Text>
                  <Text className="text-sm text-gray-600">Justo cuando más importa</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Benefits Section */}
          <View className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100">
            <Text className="font-semibold text-lg text-blue-800 mb-3 text-center">¿Por Qué Elegir OutMind?</Text>
            <Text className="text-center text-base leading-6 text-blue-700">
              Más que una aplicación de recordatorios, OutMind es un compañero gentil diseñado para reducir la carga cognitiva y traer tranquilidad a tus transiciones cotidianas. Olvidar se vuelve menos probable, y estar presente se vuelve más fácil.
            </Text>
          </View>

          {/* CTA Section */}
          <View className="w-full items-center">
            <Link 
              href="/contact" 
              className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl w-full text-center shadow-lg mb-3"
            >
              Contáctanos
            </Link>
          </View>
        </View>
      </ScrollView>

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
          
          <TouchableOpacity className="items-center py-2 px-3 rounded-lg">
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
            </View>
            <Text className="text-blue-600 text-xs font-medium">Acerca de</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default About