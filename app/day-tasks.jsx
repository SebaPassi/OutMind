import { Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import "../global.css"

const DayTasks = () => {
  const { date } = useLocalSearchParams()

  const tasks = [
    { id: 't1', title: 'Sacar basura', profile: 'Todos', time: '20:00' },
    { id: 't2', title: 'Oftalmólogo', profile: 'María', time: '16:30' },
    { id: 't3', title: 'Pasear perro', profile: 'Tomás', time: '08:30' },
  ]

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black font-bold text-lg">Actividades del día</Text>
        <View className="w-6" />
      </View>

      <View className="px-4 mt-2">
        <Text className="text-center text-lg font-semibold mb-6">{date}</Text>

        <ScrollView>
          {tasks.map((t) => (
            <View key={t.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-black font-medium text-base">{t.title}</Text>
                <Text className="text-gray-600 text-sm mt-1">{t.profile} • {t.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="gray" />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View className="mt-auto bg-white border-t border-gray-200 px-6 py-3">
        <View className="flex-row justify-around items-center">
          <TouchableOpacity className="items-center py-2 px-3 rounded-lg" onPress={() => router.push('/home')}>
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="home" size={20} color="#6B7280" />
            </View>
            <Text className="text-gray-500 text-xs font-medium">Inicio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center py-2 px-3 rounded-lg" onPress={() => router.push('/calendar')}>
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="calendar" size={20} color="#3B82F6" />
            </View>
            <Text className="text-blue-600 text-xs font-medium">Calendario</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center py-2 px-3 rounded-lg" onPress={() => router.push('/camera')}>
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="camera" size={20} color="#6B7280" />
            </View>
            <Text className="text-gray-500 text-xs font-medium">Cámara</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center py-2 px-3 rounded-lg" onPress={() => router.push('/about')}>
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="information-circle" size={20} color="#6B7280" />
            </View>
            <Text className="text-gray-500 text-xs font-medium">Acerca de</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default DayTasks
