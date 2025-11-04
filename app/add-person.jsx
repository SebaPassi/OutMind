import { Text, View, TouchableOpacity, TextInput, Alert, Image } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { supabase } from '../src/supabaseClient'
import "../global.css"

const AddPerson = () => {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [photo, setPhoto] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

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
      'Seleccionar Foto',
      '¿Cómo quieres agregar la foto?',
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

  // Función mejorada para subir imagen a Storage
  const uploadToStorage = async (uri) => {
    try {
      console.log('🔄 Iniciando subida de imagen...')
      console.log('📍 URI local:', uri)
      
      // Verificar que el archivo existe y tiene contenido
      const fileInfo = await FileSystem.getInfoAsync(uri)
      console.log('📁 Información del archivo:', fileInfo)
      
      if (!fileInfo.exists) {
        throw new Error('El archivo no existe')
      }
      
      if (fileInfo.size === 0) {
        throw new Error('El archivo está vacío (0 bytes)')
      }
      
      console.log('📦 Tamaño del archivo:', fileInfo.size, 'bytes')
      
      // Generar nombre único para evitar conflictos
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileName = `profile_${timestamp}_${randomString}.jpg`
      
      console.log('📝 Nombre del archivo:', fileName)
      
      // Leer el archivo como base64
      console.log('📖 Leyendo archivo como base64...')
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      
      if (!base64Data || base64Data.length === 0) {
        throw new Error('No se pudo leer el contenido del archivo')
      }
      
      console.log('📊 Tamaño del base64:', base64Data.length, 'caracteres')
      
      // Subir a Supabase Storage usando base64 directamente
      console.log('☁️ Subiendo a Supabase Storage...')
      const { error } = await supabase.storage
        .from('profile_pictures')
        .upload(fileName, decode(base64Data), {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Error en Storage:', error)
        throw error
      }

      console.log('✅ Imagen subida exitosamente')

      // Obtener URL pública de la imagen
      const { data } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(fileName)

      console.log('🔗 URL pública obtenida:', data.publicUrl)
      return data.publicUrl

    } catch (error) {
      console.error('❌ Error subiendo imagen:', error)
      throw new Error(`No se pudo subir la imagen: ${error.message}`)
    }
  }

  // Función auxiliar para convertir base64 a Uint8Array
  const decode = (base64) => {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

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

    if (!photo) {
      Alert.alert('Error', 'Por favor selecciona una foto')
      return
    }

    setIsLoading(true)
    setUploadProgress(25)

    try {
      console.log('🚀 Iniciando proceso de guardado...')
      
      // Subir imagen a Storage
      const storageUrl = await uploadToStorage(photo)
      setUploadProgress(75)
      
      console.log('💾 Guardando perfil en base de datos...')
      
      // Guardar perfil SOLO con la URL de Storage
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            name: name.trim(),
            age: ageNumber,
            profile_picture_url: storageUrl, // SOLO la URL de Storage
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        console.error('❌ Error guardando perfil:', error)
        Alert.alert('Error', 'No se pudo guardar la persona')
        return
      }

      setUploadProgress(100)
      console.log('✅ Perfil guardado exitosamente')

      Alert.alert(
        'Éxito',
        `${name} ha sido agregado a la familia`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      )
    } catch (error) {
      console.error('❌ Error general:', error)
      Alert.alert('Error', error.message)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black font-bold text-lg">Agregar Persona</Text>
        <View className="w-8 h-8" />
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
                <Text className="text-gray-500 text-sm mt-2 text-center">Agregar Foto</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-gray-600 text-sm mt-2 text-center">
            Toca para seleccionar o tomar una foto
          </Text>
        </View>

        {/* Upload Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <View className="mb-4">
            <View className="bg-gray-200 rounded-full h-2">
              <View 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              />
            </View>
            <Text className="text-blue-600 text-sm text-center mt-1">
              Subiendo imagen... {uploadProgress}%
            </Text>
          </View>
        )}

        {/* Form Fields */}
        <View className="space-y-4">
          {/* Name Input */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ingresa el nombre"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-700 mb-4"
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

        {/* Save Button */}
        <View className="mt-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            className={`py-4 rounded-lg items-center ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <Text className="text-white font-semibold text-lg mr-2">Guardando...</Text>
                <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">Agregar a la familia</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View className="mt-6 p-4 bg-blue-50 rounded-lg">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-blue-800 text-sm ml-2 flex-1" style={{ textAlign: 'justify' }}>
              Esta persona podrá recibir recordatorios personalizados cuando salga de casa. 
              Podrás configurar sus tareas y actividades desde el calendario.
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AddPerson
