import { Text, View, TouchableOpacity, TextInput, Alert, Image } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import "../global.css"

const EditProfile = () => {
  const [name, setName] = useState('María')
  const [age, setAge] = useState('42')
  const [photo, setPhoto] = useState(null)

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled) {
        setPhoto(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen')
    }
  }

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled) {
        setPhoto(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto')
    }
  }

  const showImageOptions = () => {
    Alert.alert(
      'Cambiar Foto',
      '¿Cómo quieres cambiar la foto?',
      [
        {
          text: 'Tomar Foto',
          onPress: takePhoto,
        },
        {
          text: 'Galería',
          onPress: pickImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    )
  }

  const handleSave = () => {
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
        {/* Photo Section */}
        <View className="items-center mb-8">
          <TouchableOpacity 
            onPress={showImageOptions}
            className="w-32 h-32 bg-gray-200 rounded-full items-center justify-center border-2 border-dashed border-gray-400"
          >
            {photo ? (
              <Image source={{ uri: photo }} className="w-32 h-32 rounded-full" />
            ) : (
              <View className="items-center">
                <Ionicons name="camera" size={48} color="gray" />
                <Text className="text-gray-500 text-sm mt-2 text-center">Cambiar Foto</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-gray-600 text-sm mt-2 text-center">
            Toca para cambiar la foto
          </Text>
        </View>

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
      </View>
    </View>
  )
}

export default EditProfile
