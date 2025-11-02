import { Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { WebView } from 'react-native-webview'
import { getProfileByAruco, getTodayTasks } from '../src/services/arucoService'
import { generateReminderMessage } from '../src/services/aiService'
import "../global.css"

const CameraView = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('Iniciando cámara...')
  const webViewRef = useRef(null)
  const lastProcessedAruco = useRef(null)
  const lastProcessedTime = useRef(0)
  const THROTTLE_TIME = 5000 // 5 segundos entre procesamientos del mismo ArUco

  // Función para enviar mensaje al WebView
  const sendMessageToWebView = (message) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message))
    }
  }

  // Manejar mensajes desde el WebView
  const handleWebViewMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data)

      if (message.type === 'WEBVIEW_READY') {
        setIsLoading(false)
        setStatus('Listo para detectar ArUcos')
        return
      }

      if (message.type === 'ARUCO_DETECTED') {
        const { arucoId } = message
        const now = Date.now()

        // Throttling: evitar procesar el mismo ArUco muy seguido
        if (
          lastProcessedAruco.current === arucoId &&
          (now - lastProcessedTime.current) < THROTTLE_TIME
        ) {
          return
        }

        // Marcar como procesado
        lastProcessedAruco.current = arucoId
        lastProcessedTime.current = now

        // Procesar la detección
        await processArucoDetection(arucoId)
      }
    } catch (error) {
      console.error('Error handling WebView message:', error)
    }
  }

  // Procesar detección de ArUco: buscar perfil → consultar tareas → generar mensaje → TTS
  const processArucoDetection = async (arucoId) => {
    if (isProcessing) {
      return // Ya hay un proceso en curso
    }

    setIsProcessing(true)
    setStatus(`Detectado ArUco ${arucoId}, procesando...`)

    try {
      // 1. Buscar perfil asociado al ArUco
      const arucoData = await getProfileByAruco(arucoId)

      if (!arucoData || !arucoData.profile) {
        setStatus(`ArUco ${arucoId} no está asociado a ningún perfil`)
        sendMessageToWebView({
          type: 'UPDATE_STATUS',
          text: `ArUco ${arucoId} no encontrado`,
          statusClass: 'waiting'
        })
        setIsProcessing(false)
        return
      }

      const profile = arucoData.profile
      setStatus(`Consultando tareas de ${profile.name}...`)

      // 2. Consultar tareas del día para este perfil
      const tasks = await getTodayTasks(profile.id)

      // 3. Generar mensaje inteligente con IA
      setStatus('Generando mensaje personalizado...')
      const context = {
        currentHour: new Date().getHours(),
        currentTime: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      }

      const message = await generateReminderMessage(profile.name, tasks, context)

      // 4. Enviar mensaje al WebView para reproducir con TTS
      setStatus(`Reproduciendo mensaje para ${profile.name}...`)
      sendMessageToWebView({
        type: 'SPEAK_MESSAGE',
        text: message
      })

      // Resetear estado después de un tiempo
      setTimeout(() => {
        setStatus('Listo para detectar ArUcos')
        setIsProcessing(false)
      }, 5000)

    } catch (error) {
      console.error('Error processing ArUco detection:', error)
      setStatus('Error al procesar detección')
      Alert.alert('Error', 'No se pudo procesar la detección. Por favor intenta de nuevo.')
      setIsProcessing(false)
    }
  }

  // HTML para el WebView con Protobject
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>OutMind Camera</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100%; height: 100vh; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; }
    #camera-preview { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
    #status-indicator { position: absolute; bottom: 20px; left: 20px; background: rgba(255, 255, 255, 0.9); padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; color: #333; z-index: 1000; }
    #status-text { color: #22c55e; }
    #status-text.speaking { color: #ef4444; }
    #status-text.processing { color: #3b82f6; }
    canvas { max-width: 100%; max-height: 100%; object-fit: contain; }
  </style>
</head>
<body>
  <div id="camera-preview"></div>
  <div id="status-indicator">Estado: <span id="status-text" class="waiting">Esperando...</span></div>
  <script src="https://app.protobject.com/framework/p.js"></script>
  <script>
    let isSpeaking = false;
    let lastProcessedAruco = null;
    let lastProcessedTime = 0;
    const THROTTLE_TIME = 3000;
    Protobject.Aruco.start(200, 0);
    function sendToReactNative(message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }
    function sayMessage(message) {
      if (isSpeaking) return;
      isSpeaking = true;
      const statusText = document.getElementById('status-text');
      statusText.textContent = 'Hablando...';
      statusText.className = 'speaking';
      Protobject.TextToSpeech.play('es', message);
      const duration = Math.max(3000, (message.length / 13) * 1000);
      setTimeout(() => {
        isSpeaking = false;
        statusText.textContent = 'Esperando...';
        statusText.className = 'waiting';
      }, duration);
    }
    function updateStatus(text, className = 'waiting') {
      const statusText = document.getElementById('status-text');
      statusText.textContent = text;
      statusText.className = className;
    }
    Protobject.Aruco.onData((data) => {
      if (isSpeaking) return;
      Object.keys(data).forEach(arucoId => {
        const arucoIdNum = parseInt(arucoId);
        const now = Date.now();
        if (lastProcessedAruco === arucoIdNum && (now - lastProcessedTime) < THROTTLE_TIME) return;
        lastProcessedAruco = arucoIdNum;
        lastProcessedTime = now;
        updateStatus('Procesando...', 'processing');
        sendToReactNative({ type: 'ARUCO_DETECTED', arucoId: arucoIdNum });
      });
    });
    window.addEventListener('message', (event) => {
      try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (message.type === 'SPEAK_MESSAGE') {
          sayMessage(message.text);
        } else if (message.type === 'UPDATE_STATUS') {
          updateStatus(message.text, message.statusClass || 'waiting');
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
    Protobject.Aruco.showPreview({
      width: window.innerWidth,
      height: window.innerHeight,
      elementId: 'camera-preview'
    });
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      const container = document.getElementById('camera-preview');
      if (canvas && container && !container.contains(canvas)) {
        container.appendChild(canvas);
        canvas.style.position = 'relative';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      }
    }, 500);
    setTimeout(() => {
      sendToReactNative({ type: 'WEBVIEW_READY' });
    }, 1000);
  </script>
</body>
</html>`

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-black">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">OutMind</Text>
        <View className="w-8 h-8" />
      </View>

      {/* Status Bar */}
      {isProcessing && (
        <View className="bg-blue-600 px-4 py-2">
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="white" className="mr-2" />
            <Text className="text-white text-sm">{status}</Text>
          </View>
        </View>
      )}

      {/* WebView con cámara */}
      <View className="flex-1">
        {isLoading && (
          <View className="absolute inset-0 bg-black items-center justify-center z-10">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-4">{status}</Text>
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={{ flex: 1, backgroundColor: 'black' }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          mixedContentMode="always"
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent
            console.error('WebView error:', nativeEvent)
            setStatus('Error al cargar la cámara')
            Alert.alert('Error', 'No se pudo cargar la vista de cámara')
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent
            console.error('WebView HTTP error:', nativeEvent)
          }}
        />
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

          <TouchableOpacity className="items-center py-2 px-3 rounded-lg">
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="camera" size={20} color="#3B82F6" />
            </View>
            <Text className="text-blue-600 text-xs font-medium">Cámara</Text>
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

export default CameraView
