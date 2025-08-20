import { Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import "../global.css"

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2022, 8, 1)) // September 2022
  const [selectedDate, setSelectedDate] = useState(25)

  const daysOfWeek = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
  const calendarDays = [
    null, null, null, null, 1, 2, 3,
    4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, null
  ]

  const formatMonthYear = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

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

      {/* Calendar Header */}
      <View className="px-4 py-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-black font-semibold text-lg">{formatMonthYear(currentMonth)}</Text>
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-4" onPress={() => router.push('/add-task')}>
              <Ionicons name="add" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePreviousMonth} className="mr-2">
              <Ionicons name="chevron-back" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Days of Week */}
      <View className="px-4 mb-4">
        <View className="flex-row">
          {daysOfWeek.map((day, index) => (
            <View key={index} className="flex-1 items-center">
              <Text className="text-gray-500 text-sm font-medium">{day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Calendar Grid */}
      <View className="px-4 flex-1">
        <View className="flex-row flex-wrap">
          {calendarDays.map((day, index) => (
            <View key={index} className="w-[14.28%] aspect-square items-center justify-center">
              {day && (
                <TouchableOpacity
                  onPress={() => setSelectedDate(day)}
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    day === selectedDate 
                      ? 'bg-blue-500' 
                      : day === 15 
                        ? 'bg-gray-200' 
                        : ''
                  }`}
                >
                  <Text 
                    className={`text-sm font-medium ${
                      day === selectedDate 
                        ? 'text-white' 
                        : 'text-black'
                    }`}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
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
          
          <TouchableOpacity className="items-center py-2 px-3 rounded-lg">
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="calendar" size={20} color="#3B82F6" />
            </View>
            <Text className="text-blue-600 text-xs font-medium">Calendario</Text>
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

export default Calendar
