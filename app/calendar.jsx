import { Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React, { useMemo, useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '../src/supabaseClient'
import "../global.css"

const Calendar = () => {
  // Use current date by default
  const today = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([])
  const [loading, setLoading] = useState(false)
  
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

  const loadTasksForDate = async (dateISO) => {
    setLoading(true)
    try {
      // Convertir la fecha ISO a formato de fecha para la consulta
      const [year, month, day] = dateISO.split('-')
      const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0).toISOString()
      const endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59).toISOString()
      
      // Verificar si la fecha seleccionada ya pasó
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Resetear a inicio del día
      const isPastDate = selectedDate < today

      // Consultar tareas únicas para la fecha específica
      const { data: oneTimeTasks, error: oneTimeError } = await supabase
        .from('tasks')
        .select(`
          id,
          name,
          description,
          due_date,
          user_tasks!inner(
            id,
            status,
            profiles!inner(
              id,
              name
            )
          )
        `)
        .eq('type', 'one-time')
        .gte('due_date', startDate)
        .lte('due_date', endDate)

      if (oneTimeError) {
        console.error('Error loading one-time tasks:', oneTimeError)
        return
      }

      // Consultar tareas recurrentes que coincidan con el día de la semana
      const dayOfWeek = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getDay()
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      const currentDayName = dayNames[dayOfWeek]

      const { data: recurringTasks, error: recurringError } = await supabase
        .from('tasks')
        .select(`
          id,
          name,
          description,
          frequency,
          user_tasks!inner(
            id,
            status,
            profiles!inner(
              id,
              name
            )
          )
        `)
        .eq('type', 'recurring')
        .or(`frequency.eq.Todos los días,frequency.eq.${currentDayName}`)

      if (recurringError) {
        console.error('Error loading recurring tasks:', recurringError)
        return
      }

      // Procesar y combinar las tareas
      const allTasks = []

      // Procesar tareas únicas
      oneTimeTasks?.forEach(task => {
        const dueDate = new Date(task.due_date)
        const timeString = dueDate.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })

        // Verificar si la tarea está asignada a todos los perfiles
        const assignedProfiles = task.user_tasks.map(ut => ut.profiles.name)
        const isAssignedToAll = assignedProfiles.length > 1

        if (isAssignedToAll) {
          // Si está asignada a múltiples perfiles, crear una sola entrada
          allTasks.push({
            id: task.id,
            title: task.name,
            description: task.description,
            time: timeString,
            profile: 'Todos',
            status: isPastDate ? 'completed' : 'pending',
            type: 'one-time',
            assignedProfiles: assignedProfiles
          })
        } else {
          // Si está asignada a un solo perfil, crear entrada individual
          task.user_tasks.forEach(userTask => {
            allTasks.push({
              id: `${task.id}-${userTask.id}`,
              title: task.name,
              description: task.description,
              time: timeString,
              profile: userTask.profiles.name,
              status: isPastDate ? 'completed' : 'pending',
              type: 'one-time'
            })
          })
        }
      })

      // Procesar tareas recurrentes
      recurringTasks?.forEach(task => {
        // Verificar si la tarea está asignada a todos los perfiles
        const assignedProfiles = task.user_tasks.map(ut => ut.profiles.name)
        const isAssignedToAll = assignedProfiles.length > 1

        if (isAssignedToAll) {
          // Si está asignada a múltiples perfiles, crear una sola entrada
          allTasks.push({
            id: task.id,
            title: task.name,
            description: task.description,
            time: '09:00', // Hora por defecto para tareas recurrentes
            profile: 'Todos',
            status: isPastDate ? 'completed' : 'pending',
            type: 'recurring',
            frequency: task.frequency,
            assignedProfiles: assignedProfiles
          })
        } else {
          // Si está asignada a un solo perfil, crear entrada individual
          task.user_tasks.forEach(userTask => {
            allTasks.push({
              id: `${task.id}-${userTask.id}`,
              title: task.name,
              description: task.description,
              time: '09:00', // Hora por defecto para tareas recurrentes
              profile: userTask.profiles.name,
              status: isPastDate ? 'completed' : 'pending',
              type: 'recurring',
              frequency: task.frequency
            })
          })
        }
      })

      setTasksForSelectedDate(allTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasksForDate(selectedDateISO)
  }, [selectedDateISO])

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

  const handleDayPress = (day) => {
    setSelectedDay(day)
    const newDateISO = buildDateISO(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    setSelectedDateISO(newDateISO)
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

      {/* Calendar Grid - Fixed height */}
      <View className="px-4 mb-4">
        <View className="flex-row flex-wrap" style={{ height: 280 }}>
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
                    onPress={() => handleDayPress(day)}
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

      {/* Tasks for selected day - Scrollable */}
      <View className="flex-1 px-4">
        <Text className="text-black font-semibold mb-3">Tareas del día</Text>
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {loading ? (
            <View className="items-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
              <Text className="text-gray-500">Cargando tareas...</Text>
            </View>
          ) : tasksForSelectedDate.length === 0 ? (
            <View className="items-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
              <Text className="text-gray-500">No hay tareas para este día</Text>
            </View>
          ) : (
            tasksForSelectedDate.map((t) => (
              <TouchableOpacity 
                key={t.id} 
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 flex-row justify-between items-center"
                onPress={() => {
                  // Extraer taskId y userTaskId del id compuesto
                  const [taskId, userTaskId] = t.id.includes('-') ? t.id.split('-') : [t.id, null]
                  if (userTaskId) {
                    router.push({
                      pathname: '/task-detail',
                      params: { taskId, userTaskId }
                    })
                  } else {
                    // Si es una tarea para "Todos", mostrar un mensaje o manejar de otra manera
                    Alert.alert('Tarea para todos', 'Esta tarea está asignada a todos los perfiles')
                  }
                }}
              >
                <View className="flex-1">
                  <Text className="text-black font-medium">{t.title}</Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {t.profile} • {t.time}
                    {t.type === 'recurring' && ` • ${t.frequency}`}
                  </Text>
                  {t.description && (
                    <Text className="text-gray-500 text-xs mt-1">{t.description}</Text>
                  )}
                  {/* Etiqueta de estado */}
                  <View className="mt-2">
                    <View className={`px-2 py-1 rounded-full self-start ${
                      t.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        t.status === 'completed' ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {t.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="gray" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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