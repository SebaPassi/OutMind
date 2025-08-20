import { Text, View, TouchableOpacity } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import "../global.css"

const Calendar = () => {
  // Use current date by default
  const today = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const buildDateISO = (year, monthIndex, day) => {
    const yyyy = year
    const mm = String(monthIndex + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
  const [selectedDateISO, setSelectedDateISO] = useState(
    buildDateISO(today.getFullYear(), today.getMonth(), today.getDate())
  )

  const daysOfWeek = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO']

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const leadingNulls = (firstDay.getDay() + 6) % 7
    const arr = Array.from({ length: leadingNulls }, () => null)
    for (let d = 1; d <= daysInMonth; d += 1) arr.push(d)
    return arr
  }, [currentMonth])

  const allTasks = useMemo(() => {
    const isoToday = buildDateISO(today.getFullYear(), today.getMonth(), today.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const isoTomorrow = buildDateISO(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
    return [
      { id: 't1', title: 'Sacar basura', time: '20:00', profile: 'Todos', date: isoToday },
      { id: 't2', title: 'Oftalmólogo', time: '16:30', profile: 'María', date: isoToday },
      { id: 't3', title: 'Pasear perro', time: '08:30', profile: 'Tomás', date: isoTomorrow },
    ]
  }, [])
  const tasksForSelectedDate = useMemo(
    () => allTasks.filter((t) => t.date === selectedDateISO),
    [allTasks, selectedDateISO]
  )

  const formatMonthYear = (date) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
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
              {day && (() => {
                const isToday =
                  currentMonth.getFullYear() === today.getFullYear() &&
                  currentMonth.getMonth() === today.getMonth() &&
                  day === today.getDate()
                const isSelected = day === selectedDay
                const bg = isSelected ? 'bg-blue-600' : isToday ? 'bg-gray-200' : ''
                const color = isSelected ? 'text-white' : 'text-black'
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDay(day)
                      setSelectedDateISO(
                        buildDateISO(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          day
                        )
                      )
                    }}
                    className={`w-8 h-8 rounded-full items-center justify-center ${bg}`}
                  >
                    <Text className={`text-sm font-medium ${color}`}>{day}</Text>
                  </TouchableOpacity>
                )
              })()}
            </View>
          ))}
        </View>
      </View>

      {/* Tasks for selected day */}
      <View className="px-4 pb-4">
        <Text className="text-black font-semibold mb-3">Tareas del día</Text>
        {tasksForSelectedDate.length === 0 ? (
          <View className="items-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
            <Text className="text-gray-500">No hay tareas para este día</Text>
          </View>
        ) : (
          tasksForSelectedDate.map((t) => (
            <View key={t.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-black font-medium">{t.title}</Text>
                <Text className="text-gray-600 text-sm mt-1">{t.profile} • {t.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="gray" />
            </View>
          ))
        )}
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
