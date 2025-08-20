import { Text, View, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
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
  const profileOptions = useMemo(() => ['Todos', 'María', 'Martin', 'Matias', 'Manuel'], [])
  const dateOptions = useMemo(() => generateNextDates(45), [])
  const timeOptions = useMemo(() => generateTimeOptions(), [])

  const [selectedProfile, setSelectedProfile] = useState(
    profileName ? String(profileName) : 'Todos'
  )
  const [taskTitle, setTaskTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState(dateOptions[1] || '')
  const [selectedTime, setSelectedTime] = useState('18:00')

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)

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
          <Text className="text-gray-700 text-xs mb-2">Tarea</Text>
          <TextInput
            placeholder="Sacar basura"
            value={taskTitle}
            onChangeText={setTaskTitle}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

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

        <TouchableOpacity className="mt-2 bg-blue-600 rounded-lg py-4 items-center">
          <Text className="text-white font-semibold">Guardar tarea (placeholder)</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View className="mt-auto bg-white border-t border-gray-200 px-4 py-2">
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

      {/* Modals */}
      {!profileId && (
        <OptionModal
          visible={showProfileModal}
          title="Seleccionar perfil"
          options={profileOptions}
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
    </View>
  )
}

export default AddTask
