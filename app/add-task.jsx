import { Text, View, TouchableOpacity, TextInput, Modal, FlatList, Alert } from 'react-native'
import React, { useMemo, useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../src/supabaseClient'
import "../global.css"

const generateNextDates = (daysAhead = 30) => {
  const dates = []
  const now = new Date()
  for (let i = 0; i < daysAhead; i += 1) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    dates.push(`${dd}-${mm}-${yyyy}`)
  }
  return dates
}

const generateTimeOptions = () => {
  const times = []
  for (let h = 6; h <= 22; h += 1) {
    for (let m of [0, 30]) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      times.push(`${hh}:${mm}`)
    }
  }
  return times
}

const Selector = ({ label, value, onPress }) => (
  <View className="mb-5">
    <Text className="text-gray-700 text-xs mb-2">{label}</Text>
    <TouchableOpacity
      onPress={onPress}
      className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
    >
      <Text className="text-gray-800">{value}</Text>
      <Ionicons name="chevron-down" size={18} color="gray" />
    </TouchableOpacity>
  </View>
)

const OptionModal = ({ visible, title, options, onClose, onSelect }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View className="flex-1 bg-black/30 justify-end">
      <View className="bg-white rounded-t-2xl p-4 max-h-[60%]">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-semibold">{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color="black" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item, idx) => `${item}-${idx}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item)
                onClose()
              }}
              className="py-3 border-b border-gray-100"
            >
              <Text className="text-gray-800">{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </Modal>
)

const AddTask = () => {
  const { profileId, profileName } = useLocalSearchParams()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  
  const dateOptions = useMemo(() => generateNextDates(45), [])
  const timeOptions = useMemo(() => generateTimeOptions(), [])

  const [selectedProfile, setSelectedProfile] = useState(
    profileName ? String(profileName) : 'Cargando...'
  )
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [selectedDate, setSelectedDate] = useState(dateOptions[1] || '')
  const [selectedTime, setSelectedTime] = useState('18:00')
  const [taskType, setTaskType] = useState('recurring')
  const [taskFrequency, setTaskFrequency] = useState('Todos los días')

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)

  // Cargar perfiles desde Supabase
  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Error loading profiles:', error)
        return
      }

      setProfiles(data || [])
      
      // Si no hay profileId, seleccionar el primer perfil por defecto
      if (!profileId && data && data.length > 0) {
        setSelectedProfile(data[0].name)
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
    }
  }

  // Cargar perfiles al montar el componente
  useEffect(() => {
    loadProfiles()
  }, [])

  // Obtener el ID del perfil seleccionado
  const getSelectedProfileId = () => {
    if (profileId) return parseInt(profileId)
    
    const profile = profiles.find(p => p.name === selectedProfile)
    return profile ? profile.id : null
  }

  // Guardar la tarea en Supabase
  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Por favor ingresa el título de la tarea')
      return
    }

    const selectedProfileId = getSelectedProfileId()
    if (!selectedProfileId) {
      Alert.alert('Error', 'Por favor selecciona un perfil')
      return
    }

    setLoading(true)

    try {
      // 1. Crear la tarea en la tabla tasks
      const taskData = {
        name: taskTitle.trim(),
        description: taskDescription.trim() || null,
        type: taskType,
        frequency: taskFrequency,
        due_date: taskType === 'one-time' ? parseDate(selectedDate, selectedTime) : null,
        created_at: new Date().toISOString()
      }

      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()

      if (taskError) {
        console.error('Error creating task:', taskError)
        Alert.alert('Error', 'No se pudo crear la tarea')
        return
      }

      const newTaskId = taskResult[0].id

      const userTaskData = {
        user_id: selectedProfileId,
        task_id: newTaskId,
        status: 'pending',
        assigned_at: new Date().toISOString()
      }

      const { error: userTaskError } = await supabase
        .from('user_tasks')
        .insert([userTaskData])

      if (userTaskError) {
        console.error('Error assigning task to user:', userTaskError)
        Alert.alert('Error', 'No se pudo asignar la tarea al usuario')
        return
      }

      Alert.alert(
        'Éxito',
        `Tarea "${taskTitle}" creada y asignada a ${selectedProfile}`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      )

    } catch (error) {
      console.error('Error saving task:', error)
      Alert.alert('Error', 'Ocurrió un error inesperado al guardar la tarea')
    } finally {
      setLoading(false)
    }
  }

  const parseDate = (dateStr, timeStr) => {
    const [dd, mm, yyyy] = dateStr.split('-')
    const [hh, minutes] = timeStr.split(':')
    return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd), parseInt(hh), parseInt(minutes)).toISOString()
  }

  const taskTypeOptions = [
    { value: 'recurring', label: 'Recurrente' },
    { value: 'one-time', label: 'Única' }
  ]

  const frequencyOptions = [
    'Todos los días',
    'Todos los lunes',
    'Todos los martes',
    'Todos los miércoles',
    'Todos los jueves',
    'Todos los viernes',
    'Todos los sábados',
    'Todos los domingos',
    'Cada semana',
    'Cada mes'
  ]

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black font-bold text-lg">OutMind</Text>
        <View className="w-6" />
      </View>

      <View className="px-4 mt-2">
        <Text className="text-center text-lg font-semibold mb-6">Agregar Tarea</Text>

        {!profileId && (
          <Selector
            label="Perfil"
            value={selectedProfile}
            onPress={() => setShowProfileModal(true)}
          />
        )}

        <View className="mb-5">
          <Text className="text-gray-700 text-xs mb-2">Título de la Tarea</Text>
          <TextInput
            placeholder="Sacar basura"
            value={taskTitle}
            onChangeText={setTaskTitle}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View className="mb-5">
          <Text className="text-gray-700 text-xs mb-2">Descripción (opcional)</Text>
          <TextInput
            placeholder="Descripción detallada de la tarea"
            value={taskDescription}
            onChangeText={setTaskDescription}
            multiline
            numberOfLines={3}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Selector
          label="Tipo de Tarea"
          value={taskType === 'recurring' ? 'Recurrente' : 'Única'}
          onPress={() => setShowTypeModal(true)}
        />

        {taskType === 'recurring' && (
          <Selector
            label="Frecuencia"
            value={taskFrequency}
            onPress={() => setShowFrequencyModal(true)}
          />
        )}

        {taskType === 'one-time' && (
          <>
            <Selector
              label="Fecha"
              value={selectedDate}
              onPress={() => setShowDateModal(true)}
            />

            <Selector
              label="Hora"
              value={selectedTime}
              onPress={() => setShowTimeModal(true)}
            />
          </>
        )}

        <TouchableOpacity 
          className={`mt-6 rounded-lg py-4 items-center ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
          onPress={handleSaveTask}
          disabled={loading}
        >
          {loading ? (
            <View className="flex-row items-center">
              <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <Text className="text-white font-semibold text-lg">Guardando...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">Guardar Tarea</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View className="mt-auto bg-white border-t border-gray-200 px-6 py-3">
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

      {/* Modals */}
      {!profileId && (
        <OptionModal
          visible={showProfileModal}
          title="Seleccionar perfil"
          options={profiles.map(p => p.name)}
          onClose={() => setShowProfileModal(false)}
          onSelect={setSelectedProfile}
        />
      )}

      <OptionModal
        visible={showDateModal}
        title="Seleccionar fecha"
        options={dateOptions}
        onClose={() => setShowDateModal(false)}
        onSelect={setSelectedDate}
      />

      <OptionModal
        visible={showTimeModal}
        title="Seleccionar hora"
        options={timeOptions}
        onClose={() => setShowTimeModal(false)}
        onSelect={setSelectedTime}
      />

      <OptionModal
        visible={showTypeModal}
        title="Seleccionar tipo de tarea"
        options={taskTypeOptions.map(t => t.label)}
        onClose={() => setShowTypeModal(false)}
        onSelect={(label) => {
          const option = taskTypeOptions.find(t => t.label === label)
          const newType = option ? option.value : 'recurring'
          setTaskType(newType)
          
          if (newType === 'one-time') {
            setSelectedDate(dateOptions[1] || '')
            setSelectedTime('18:00')
          } else {
            setTaskFrequency('Todos los días')
          }
        }}
      />

      <OptionModal
        visible={showFrequencyModal}
        title="Seleccionar frecuencia"
        options={frequencyOptions}
        onClose={() => setShowFrequencyModal(false)}
        onSelect={setTaskFrequency}
      />
    </View>
  )
}

export default AddTask
