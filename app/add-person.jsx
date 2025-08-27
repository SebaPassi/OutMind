import { Text, View, TouchableOpacity, TextInput, Alert, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { supabase } from '../src/supabaseClient'
import { setupStorageBucket, checkStoragePermissions } from '../src/supabaseStorageSetup'
import "../global.css"

const AddPerson = () => {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [photo, setPhoto] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Configurar storage al cargar el componente
  useEffect(() => {
    const initializeStorage = async () => {
      console.log('🚀 Inicializando configuración de storage...')
      const bucketSetup = await setupStorageBucket()
      if (bucketSetup) {
        await checkStoragePermissions()
      }
    }
    
    initializeStorage()
  }, [])

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

  const uploadImageToSupabase = async (imageUri) => {
    try {
      console.log('🚀 Iniciando subida de imagen...')
      console.log('📁 URI de imagen:', imageUri)
      
      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileName = `profile_${timestamp}_${randomString}.jpg`
      console.log('📝 Nombre del archivo:', fileName)
      
      // Verificar si la URI es válida
      if (!imageUri || imageUri.trim() === '') {
        throw new Error('URI de imagen inválida')
      }
      
      // Leer el archivo usando FileSystem
      console.log('📖 Leyendo archivo con FileSystem...')
      const fileInfo = await FileSystem.getInfoAsync(imageUri)
      console.log('📊 Información del archivo:', fileInfo)
      
      if (!fileInfo.exists) {
        throw new Error('El archivo no existe')
      }
      
      console.log('📁 Tamaño del archivo:', fileInfo.size, 'bytes')
      
      // Leer el archivo como base64
      console.log('🔄 Leyendo archivo como base64...')
      const base64Data = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64
      })
      
      console.log('✅ Base64 leído, longitud:', base64Data.length)
      
      // Convertir base64 a blob
      console.log('🔄 Convirtiendo base64 a blob...')
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      
      console.log('✅ Blob creado, tamaño:', blob.size, 'bytes')
      console.log('📋 Blob type:', blob.type)
      
      if (blob.size === 0) {
        throw new Error('El blob está vacío (0 bytes)')
      }
      
      // Verificar si el bucket existe
      console.log('🔍 Verificando bucket profile_pictures...')
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      if (bucketsError) {
        console.error('❌ Error listando buckets:', bucketsError)
      } else {
        console.log('📦 Buckets disponibles:', buckets.map(b => b.name))
      }
      
      // Subir a Supabase Storage
      console.log('📤 Subiendo imagen a Supabase Storage...')
      console.log('📦 Bucket:', 'profile_pictures')
      console.log('📝 Nombre archivo:', fileName)
      console.log('📊 Tamaño blob:', blob.size, 'bytes')
      
      const { data, error } = await supabase.storage
        .from('profile_pictures')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Error uploading image:', error)
        throw new Error(`No se pudo subir la imagen: ${error.message}`)
      }

      console.log('✅ Imagen subida exitosamente:', data)

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(fileName)

      console.log('🔗 URL pública generada:', publicUrl)
      return publicUrl
    } catch (error) {
      console.error('❌ Error in uploadImageToSupabase:', error)
      throw error
    }
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

    try {
      console.log('💾 Iniciando guardado de perfil...')
      console.log('📸 Foto seleccionada:', photo)
      
      // Primero subir la imagen a Supabase Storage
      console.log('📤 Subiendo imagen...')
      const imageUrl = await uploadImageToSupabase(photo)
      console.log('✅ Imagen subida, URL:', imageUrl)
      
             // Luego guardar el perfil con la URL de la imagen
       console.log('💾 Guardando perfil en base de datos...')
       const { data, error } = await supabase
         .from('profiles')
         .insert([
           {
             name: name.trim(),
             age: ageNumber,
             profile_picture_url: imageUrl,
             created_at: new Date().toISOString()
           }
         ])
         .select()

      if (error) {
        console.error('❌ Error inserting profile:', error)
        Alert.alert('Error', 'No se pudo guardar la persona en la base de datos')
        return
      }

      console.log('✅ Perfil guardado exitosamente:', data)

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
      console.error('Error saving profile:', error)
      Alert.alert('Error', 'Ocurrió un error inesperado al guardar')
    } finally {
      setIsLoading(false)
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
