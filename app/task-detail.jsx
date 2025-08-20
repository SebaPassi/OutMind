import { Text, View, TouchableOpacity, TextInput, Modal, FlatList, Alert, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
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

const TaskDetail = () => {
  const { taskId, userTaskId } = useLocalSearchParams()
  const [task, setTask] = useState(null)
  const [userTask, setUserTask] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const dateOptions = generateNextDates(45)
  const timeOptions = generateTimeOptions()

  // Estados para edición
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [taskType, setTaskType] = useState('recurring')
  const [taskFrequency, setTaskFrequency] = useState('Todos los días')
  const [selectedProfile, setSelectedProfile] = useState('')

  // Estados para modales
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)

  const loadTask = async () => {
    try {
      // Cargar la tarea y su información de usuario
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`
          *,
          user_tasks!inner(
            id,
            status,
            assigned_at,
            profiles!inner(
              id,
              name
            )
          )
        `)
        .eq('id', taskId)
        .eq('user_tasks.id', userTaskId)
        .single()

      if (taskError) {
        console.error('Error loading task:', taskError)
        Alert.alert('Error', 'No se pudo cargar la tarea')
        return
      }

      setTask(taskData)
      setUserTask(taskData.user_tasks[0])

      // Cargar perfiles para edición
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name')

      if (profilesError) {
        console.error('Error loading profiles:', profilesError)
      } else {
        setProfiles(profilesData || [])
      }

      // Inicializar estados de edición
      setTaskTitle(taskData.name)
      setTaskDescription(taskData.description || '')
      setTaskType(taskData.type)
      setTaskFrequency(taskData.frequency || 'Todos los días')
      setSelectedProfile(taskData.user_tasks[0].profiles.name)

      if (taskData.type === 'one-time' && taskData.due_date) {
        const dueDate = new Date(taskData.due_date)
        const dd = String(dueDate.getDate()).padStart(2, '0')
        const mm = String(dueDate.getMonth() + 1).padStart(2, '0')
        const yyyy = dueDate.getFullYear()
        setSelectedDate(`${dd}-${mm}-${yyyy}`)
        
        const timeString = dueDate.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
        setSelectedTime(timeString)
      }

    } catch (error) {
      console.error('Error loading task:', error)
      Alert.alert('Error', 'Ocurrió un error al cargar la tarea')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTask()
  }, [taskId, userTaskId])

  const handleSave = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Por favor ingresa el título de la tarea')
      return
    }

    setSaving(true)

    try {
      // Actualizar la tarea
      const taskUpdateData = {
        name: taskTitle.trim(),
        description: taskDescription.trim() || null,
        type: taskType,
        frequency: taskFrequency,
        due_date: taskType === 'one-time' ? parseDate(selectedDate, selectedTime) : null,
      }

      const { error: taskError } = await supabase
        .from('tasks')
        .update(taskUpdateData)
        .eq('id', taskId)

      if (taskError) {
        console.error('Error updating task:', taskError)
        Alert.alert('Error', 'No se pudo actualizar la tarea')
        return
      }

      // Si cambió el perfil, actualizar la asignación
      if (selectedProfile !== userTask.profiles.name) {
        const newProfile = profiles.find(p => p.name === selectedProfile)
        if (newProfile) {
          // Eliminar asignación anterior
          await supabase
            .from('user_tasks')
            .delete()
            .eq('id', userTaskId)

          // Crear nueva asignación
          const { error: userTaskError } = await supabase
            .from('user_tasks')
            .insert([{
              user_id: newProfile.id,
              task_id: taskId,
              status: 'pending',
              assigned_at: new Date().toISOString()
            }])

          if (userTaskError) {
            console.error('Error updating user task assignment:', userTaskError)
            Alert.alert('Error', 'No se pudo actualizar la asignación de la tarea')
            return
          }
        }
      }

      Alert.alert(
        'Éxito',
        'Tarea actualizada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsEditing(false)
              loadTask() // Recargar datos
            },
          },
        ]
      )

    } catch (error) {
      console.error('Error saving task:', error)
      Alert.alert('Error', 'Ocurrió un error inesperado al guardar la tarea')
    } finally {
      setSaving(false)
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

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'No especificada'
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Cargando tarea...</Text>
      </View>
    )
  }

  if (!task) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Tarea no encontrada</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black font-bold text-lg">Detalle de Tarea</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Ionicons name={isEditing ? "close" : "create"} size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {isEditing ? (
          // Modo edición
          <View>
            <Text className="text-center text-lg font-semibold mb-6">Editar Tarea</Text>

            <View className="mb-5">
              <Text className="text-gray-700 text-xs mb-2">Título de la Tarea</Text>
              <TextInput
                placeholder="Título de la tarea"
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
              label="Perfil"
              value={selectedProfile}
              onPress={() => setShowProfileModal(true)}
            />

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
              className={`mt-6 rounded-lg py-4 items-center ${saving ? 'bg-gray-400' : 'bg-blue-600'}`}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <View className="flex-row items-center">
                  <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <Text className="text-white font-semibold text-lg">Guardando...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg">Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Modo visualización
          <View>
            <Text className="text-center text-lg font-semibold mb-6">Detalle de Tarea</Text>

            <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <Text className="text-black font-semibold text-lg mb-2">{task.name}</Text>
              {task.description && (
                <Text className="text-gray-600 mb-3">{task.description}</Text>
              )}
              
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Perfil:</Text>
                  <Text className="text-gray-800 font-medium">{userTask.profiles.name}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Tipo:</Text>
                  <Text className="text-gray-800 font-medium">
                    {task.type === 'recurring' ? 'Recurrente' : 'Única'}
                  </Text>
                </View>

                {task.type === 'recurring' && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500">Frecuencia:</Text>
                    <Text className="text-gray-800 font-medium">{task.frequency}</Text>
                  </View>
                )}

                {task.type === 'one-time' && (
                  <>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500">Fecha:</Text>
                      <Text className="text-gray-800 font-medium">{formatDate(task.due_date)}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500">Hora:</Text>
                      <Text className="text-gray-800 font-medium">{formatTime(task.due_date)}</Text>
                    </View>
                  </>
                )}

                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Estado:</Text>
                  <Text className={`font-medium ${
                    userTask.status === 'completed' ? 'text-green-600' : 
                    userTask.status === 'in_progress' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {userTask.status === 'completed' ? 'Completada' :
                     userTask.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Asignada:</Text>
                  <Text className="text-gray-800 font-medium">{formatDate(userTask.assigned_at)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

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
      <OptionModal
        visible={showProfileModal}
        title="Seleccionar perfil"
        options={profiles.map(p => p.name)}
        onClose={() => setShowProfileModal(false)}
        onSelect={setSelectedProfile}
      />

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

export default TaskDetail
