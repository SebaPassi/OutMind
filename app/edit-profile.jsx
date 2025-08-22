import { Text, View, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native'
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
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState('')
  const [ageError, setAgeError] = useState('')

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

  const validateForm = () => {
    let isValid = true
    
    // Validar nombre
    if (!name.trim()) {
      setNameError('Por favor ingresa el nombre')
      isValid = false
    } else {
      setNameError('')
    }

    // Validar edad
    if (!age.trim()) {
      setAgeError('Por favor ingresa la edad')
      isValid = false
    } else {
      const ageNumber = parseInt(age)
      if (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 120) {
        setAgeError('Por favor ingresa una edad válida (0-120)')
        isValid = false
      } else {
        setAgeError('')
      }
    }

    return isValid
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          age: parseInt(age)
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
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4 text-lg">Cargando perfil...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-4 bg-white">
        <TouchableOpacity 
          onPress={handleCancel}
          className="px-3 py-2"
        >
          <Text className="text-blue-600 font-medium text-base">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-black font-bold text-xl">Editar Perfil</Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          className={`px-3 py-2 ${saving ? 'opacity-50' : ''}`}
        >
          <Text className="text-blue-600 font-medium text-base">
            {saving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Form Fields */}
        <View className="space-y-6">
          {/* Name Input */}
          <View>
            <Text className="text-gray-700 font-semibold mb-1 text-base">Nombre</Text>
                          <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text)
                  if (nameError) setNameError('')
                }}
                placeholder="Ingresa el nombre"
                className={`border rounded-xl px-4 py-3 mb-4 text-gray-700 text-base ${
                  nameError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholderTextColor="#9CA3AF"
                autoFocus={false}
                autoCapitalize="words"
                style={{ textAlignVertical: 'center' }}
              />
            {nameError ? (
              <Text className="text-red-500 text-sm mt-2 ml-1">{nameError}</Text>
            ) : null}
          </View>

          {/* Age Input */}
          <View>
            <Text className="text-gray-700 font-semibold mb-1 text-base">Edad</Text>
                          <TextInput
                value={age}
                onChangeText={(text) => {
                  setAge(text)
                  if (ageError) setAgeError('')
                }}
                placeholder="Ingresa la edad"
                keyboardType="numeric"
                className={`border rounded-xl px-4 py-3 text-gray-700 text-base ${
                  ageError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholderTextColor="#9CA3AF"
                maxLength={3}
                style={{ textAlignVertical: 'center' }}
              />
            {ageError ? (
              <Text className="text-red-500 text-sm mt-2 ml-1">{ageError}</Text>
            ) : null}
          </View>
        </View>

        {/* Info Section */}
        <View className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-100">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <Text className="text-blue-800 text-sm ml-3 flex-1 leading-5">
              Los cambios en el perfil se reflejarán en todos los recordatorios y tareas asociadas a esta persona.
            </Text>
          </View>
        </View>

        {/* Delete Profile Section */}
        <View className="mt-8 pt-6 border-t border-gray-200">
          <TouchableOpacity 
            onPress={handleDeleteProfile}
            className="flex-row items-center justify-center py-5 px-6 bg-red-50 border border-red-200 rounded-xl active:bg-red-100"
          >
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
            <Text className="text-red-600 font-semibold ml-3 text-base">Eliminar perfil</Text>
          </TouchableOpacity>
          <Text className="text-gray-500 text-xs text-center mt-3 px-4">
            Esta acción no se puede deshacer
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default EditProfile
