import { Text, View, TouchableOpacity, ScrollView, Alert, Image } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import "../global.css"

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  
  const [profile, setProfile] = useState({
    id: 2,
    name: 'María',
    age: 42,
    image: null
  })

  const tasks = [
    {
      id: 1,
      title: 'Sacar basura',
      frequency: 'Todos los martes',
      type: 'recurring'
    },
    {
      id: 2,
      title: 'Oftalmólogo',
      frequency: '16-08-2025',
      type: 'one-time'
    },
    {
      id: 3,
      title: 'Pasear perro',
      frequency: 'Todos los días',
      type: 'recurring'
    }
  ]

  const handleEditProfile = () => {
    setIsEditing(true)
    router.push('/edit-profile')
  }

  const handleAddTask = () => {
    Alert.alert('Agregar Tarea', 'Función para agregar tareas próximamente')
  }

  const handleTaskPress = (task) => {
    Alert.alert('Tarea', `Editar: ${task.title}`)
  }

  const handleDeleteProfile = () => {
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
          onPress: () => {
            Alert.alert('Perfil Eliminado', `${profile.name} ha sido eliminado de la familia`)
            router.back()
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
        <Text className="text-black font-bold text-lg">OutMind</Text>
        <TouchableOpacity onPress={handleEditProfile}>
          <Ionicons name="settings" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View className="items-center py-6">
        <View className="w-24 h-24 bg-gray-300 rounded-full items-center justify-center mb-4">
          {profile.image ? (
            <Image source={{ uri: profile.image }} className="w-24 h-24 rounded-full" />
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
            className="bg-blue-600 px-3 py-1 rounded-lg"
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => handleTaskPress(task)}
              className="bg-gray-100 rounded-lg p-4 mb-3 flex-row justify-between items-center"
            >
              <View className="flex-1">
                <Text className="text-black font-medium text-base">{task.title}</Text>
                <Text className="text-gray-600 text-sm mt-1">{task.frequency}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="gray" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View className="px-4 py-6 space-y-4">
        <TouchableOpacity
          onPress={handleEditProfile}
          className="bg-blue-600 py-4 rounded-lg items-center shadow-sm"
        >
          <Text className="text-white font-semibold text-lg">Editar Perfil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleDeleteProfile}
          className="bg-red-500 py-4 rounded-lg items-center shadow-sm"
        >
          <Text className="text-white font-semibold text-lg">Eliminar Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View className="bg-white border-t border-gray-200 px-4 py-2">
        <View className="flex-row justify-around items-center">
          <TouchableOpacity className="items-center py-2" onPress={() => router.push('/home')}>
            <Ionicons name="home" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-2" onPress={() => router.push('/calendar')}>
            <Ionicons name="grid" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-2" onPress={() => router.push('/camera')}>
            <Ionicons name="camera" size={24} color="gray" />
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
