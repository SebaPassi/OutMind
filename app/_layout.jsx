import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import "../global.css"

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          animation: 'none', // Sin transiciones
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="add-person" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="about" />
        <Stack.Screen name="add-task" />
        <Stack.Screen name="day-tasks" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="contact" />
        <Stack.Screen name="task-detail" />
      </Stack>
    </SafeAreaProvider>
  )
}
