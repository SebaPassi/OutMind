import { Text, View, TouchableOpacity, TextInput, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../src/supabaseClient'
import "../global.css"

const EditProfile = () => {
  const { profileId } = useLocalSearchParams()
  const profileIdNumber = profileId ? parseInt(profileId) : null
  
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(true)

  // Cargar datos del perfil
  const loadProfile = async () => {
    if (!profileIdNumber) {
      Alert.alert('Error', 'No se proporcionó un ID de perfil válido')
      router.back()
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileIdNumber)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        Alert.alert('Error', 'No se pudo cargar el perfil')
        router.back()
        return
      }

      setName(data.name || '')
      setAge(data.age ? String(data.age) : '')
    } catch (error) {
      console.error('Error loading profile:', error)
      Alert.alert('Error', 'Ocurrió un error al cargar el perfil')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [profileIdNumber])

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre')
      return
    }

    if (!age.trim()) {
      Alert.alert('Error', 'Por favor ingresa la edad')
      return
    }

    const ageNumber = parseInt(age)
    if (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 120) {
      Alert.alert('Error', 'Por favor ingresa una edad válida')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          age: ageNumber
        })
        .eq('id', profileIdNumber)

      if (error) {
        console.error('Error updating profile:', error)
        Alert.alert('Error', 'No se pudo actualizar el perfil')
        return
      }

      Alert.alert(
        'Éxito',
        'Perfil actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      )
    } catch (error) {
      console.error('Error updating profile:', error)
      Alert.alert('Error', 'Ocurrió un error al actualizar el perfil')
    }
  }

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Cambios',
      '¿Estás seguro de que quieres cancelar? Los cambios no se guardarán.',
      [
        {
          text: 'Continuar Editando',
          style: 'cancel',
        },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    )
  }

  const handleDeleteProfile = async () => {
    Alert.alert(
      'Eliminar Perfil',
      '¿Estás seguro de que quieres eliminar este perfil? Esta acción no se puede deshacer.',
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
              // Primero eliminar las tareas asociadas al perfil
              const { error: tasksError } = await supabase
                .from('user_tasks')
                .delete()
                .eq('user_id', profileIdNumber)

              if (tasksError) {
                console.error('Error deleting user tasks:', tasksError)
              }

              // Luego eliminar el perfil
              const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', profileIdNumber)

              if (profileError) {
                console.error('Error deleting profile:', profileError)
                Alert.alert('Error', 'No se pudo eliminar el perfil')
                return
              }

              Alert.alert(
                'Perfil Eliminado',
                'El perfil ha sido eliminado correctamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.push('/home'),
                  },
                ]
              )
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
        <TouchableOpacity onPress={handleCancel}>
          <Text className="text-blue-600 font-medium">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-black font-bold text-lg">Editar Perfil</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-blue-600 font-medium">Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <View className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <Text className="text-gray-500 mt-2">Cargando perfil...</Text>
          </View>
        ) : (
          <>
            {/* Form Fields */}
            <View className="space-y-4">
              {/* Name Input */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">Nombre</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ingresa el nombre"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                  placeholderTextColor="gray"
                />
              </View>

              {/* Age Input */}
              <View>
                <Text className="text-gray-700 font-medium mb-2">Edad</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="Ingresa la edad"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                  placeholderTextColor="gray"
                />
              </View>
            </View>

            {/* Info Section */}
            <View className="mt-6 p-4 bg-blue-50 rounded-lg">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-blue-800 text-sm ml-2 flex-1">
                  Los cambios en el perfil se reflejarán en todos los recordatorios y tareas asociadas a esta persona.
                </Text>
              </View>
            </View>

            {/* Delete Profile Section */}
            <View className="mt-8 pt-6 border-t border-gray-200">
              <TouchableOpacity 
                onPress={handleDeleteProfile}
                className="flex-row items-center justify-center py-4 px-6 bg-red-50 border border-red-200 rounded-lg"
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
                <Text className="text-red-600 font-medium ml-2">Eliminar perfil</Text>
              </TouchableOpacity>
              <Text className="text-gray-500 text-xs text-center mt-2">
                Esta acción no se puede deshacer
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

export default EditProfile
