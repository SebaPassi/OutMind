import { Text, View, TouchableOpacity, ScrollView, Alert, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { supabase } from '../src/supabaseClient'
import "../global.css"

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const { profileId } = useLocalSearchParams()
  const profileIdNumber = profileId ? parseInt(profileId) : null
  
  const [profile, setProfile] = useState({
    id: profileIdNumber || 0,
    name: 'Cargando...',
    age: 0,
    profile_picture: null
  })

  const [tasks, setTasks] = useState([])

  const loadProfile = async () => {
    if (!profileIdNumber) {
      console.error('No profileId provided')
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileIdNumber)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadUserTasks = async () => {
    if (!profileIdNumber) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('user_tasks')
        .select(`
          id,
          status,
          assigned_at,
          tasks (
            id,
            name,
            description,
            frequency,
            type,
            due_date,
            created_at
          )
        `)
        .eq('user_id', profileIdNumber)
        .order('assigned_at', { ascending: false })

      if (error) {
        console.error('Error loading tasks:', error)
        return
      }

      const transformedTasks = data.map(userTask => ({
        id: userTask.tasks.id,
        userTaskId: userTask.id,
        title: userTask.tasks.name,
        description: userTask.tasks.description,
        frequency: userTask.tasks.frequency || 'Sin frecuencia',
        type: userTask.tasks.type || 'recurring',
        status: userTask.status,
        assigned_at: userTask.assigned_at,
        due_date: userTask.tasks.due_date
      }))

      setTasks(transformedTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      if (profileIdNumber) {
        loadProfile()
        loadUserTasks()
      }
    }, [profileIdNumber])
  )

  useEffect(() => {
    if (profileIdNumber) {
      loadProfile()
      loadUserTasks()
    }
  }, [profileIdNumber])

  const handleEditProfile = () => {
    setIsEditing(true)
    router.push({ 
      pathname: '/edit-profile', 
      params: { profileId: String(profile.id) } 
    })
  }

  const handleAddTask = () => {
    router.push({ 
      pathname: '/add-task', 
      params: { 
        profileId: String(profile.id), 
        profileName: profile.name 
      } 
    })
  }

  const handleTaskPress = (task) => {
    router.push({
      pathname: '/task-detail',
      params: { 
        taskId: task.id, 
        userTaskId: task.userTaskId 
      }
    })
  }

  const handleDeleteProfile = async () => {
    Alert.alert(
      'Eliminar Perfil',
      `¿Estás seguro de que quieres eliminar el perfil de ${profile.name}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: tasksError } = await supabase
                .from('user_tasks')
                .delete()
                .eq('user_id', profile.id)

              if (tasksError) {
                console.error('Error deleting user tasks:', tasksError)
              }

              const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', profile.id)

              if (profileError) {
                console.error('Error deleting profile:', profileError)
                Alert.alert('Error', 'No se pudo eliminar el perfil')
                return
              }

              Alert.alert('Perfil Eliminado', `${profile.name} ha sido eliminado de la familia`)
              router.back()
            } catch (error) {
              console.error('Error deleting profile:', error)
              Alert.alert('Error', 'Ocurrió un error al eliminar el perfil')
            }
          },
        },
      ]
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black font-bold text-lg">Perfil</Text>
        <TouchableOpacity onPress={handleEditProfile}>
          <Ionicons name="settings" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View className="items-center py-6">
        <View className="w-24 h-24 bg-gray-300 rounded-lg items-center justify-center mb-4 overflow-hidden">
          {profile.profile_picture ? (
            <Image 
              source={{ uri: profile.profile_picture }} 
              className="w-24 h-24 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={48} color="gray" />
          )}
        </View>
        <Text className="text-black font-bold text-2xl">{profile.name}</Text>
        <Text className="text-gray-600 text-lg">{profile.age} años</Text>
      </View>

      {/* Tasks Section */}
      <View className="flex-1 px-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-black font-bold text-lg">Tareas y Recordatorios</Text>
          <TouchableOpacity 
            onPress={handleAddTask}
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-medium text-sm ml-1">Agregar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {loading ? (
            <View className="items-center py-8">
              <View className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <Text className="text-gray-500 mt-2">Cargando tareas...</Text>
            </View>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => handleTaskPress(task)}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <Text className="text-black font-medium text-base">{task.title}</Text>
                  <Text className="text-gray-600 text-sm mt-1">{task.frequency}</Text>
                  <View className="flex-row items-center mt-2 space-x-2">
                    <View className={`px-2 py-1 rounded-full ${task.type === 'recurring' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      <Text className={`text-xs font-medium ${task.type === 'recurring' ? 'text-blue-700' : 'text-green-700'}`}>
                        {task.type === 'recurring' ? 'Recurrente' : 'Única'}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${task.status === 'completed' ? 'bg-green-100' : task.status === 'overdue' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                      <Text className={`text-xs font-medium ${task.status === 'completed' ? 'text-green-700' : task.status === 'overdue' ? 'text-red-700' : 'text-yellow-700'}`}>
                        {task.status === 'completed' ? 'Completada' : task.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="gray" />
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-8">
              <Ionicons name="checkmark-circle" size={48} color="gray" />
              <Text className="text-gray-500 mt-2 text-center">No hay tareas asignadas</Text>
              <TouchableOpacity 
                className="mt-4 bg-blue-600 px-6 py-2 rounded-lg"
                onPress={handleAddTask}
              >
                <Text className="text-white font-medium">Agregar primera tarea</Text>
              </TouchableOpacity>
            </View>
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

export default Profile