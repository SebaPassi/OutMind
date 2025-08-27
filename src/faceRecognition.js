import { supabase } from './supabaseClient'

// Función temporal para extraer características faciales de una imagen
export const extractFaceFeatures = async (imageUri) => {
  try {
    // Simulación temporal hasta que se resuelva expo-face-detector
    console.log('🔧 Extracción facial temporal - configurando expo-face-detector')
    
    // Retornar características simuladas
    const faceFeatures = {
      bounds: { size: { width: 100, height: 100 } },
      landmarks: {
        nose: { x: 50, y: 50 },
        leftEye: { x: 30, y: 40 },
        rightEye: { x: 70, y: 40 },
        leftMouth: { x: 35, y: 70 },
        rightMouth: { x: 65, y: 70 }
      },
      rollAngle: 0,
      yawAngle: 0,
      smilingProbability: 0.5,
      leftEyeOpenProbability: 0.8,
      rightEyeOpenProbability: 0.8,
    }

    return faceFeatures
  } catch (error) {
    console.error('Error extracting face features:', error)
    throw error
  }
}

// Función para comparar dos rostros
export const compareFaces = (face1, face2) => {
  try {
    // Comparar características básicas
    const boundsSimilarity = compareBounds(face1.bounds, face2.bounds)
    const landmarksSimilarity = compareLandmarks(face1.landmarks, face2.landmarks)
    
    // Calcular similitud general (0-1, donde 1 es idéntico)
    const similarity = (boundsSimilarity + landmarksSimilarity) / 2
    
    return {
      similarity,
      isMatch: similarity > 0.7, // Umbral de similitud
      confidence: similarity * 100
    }
  } catch (error) {
    console.error('Error comparing faces:', error)
    return { similarity: 0, isMatch: false, confidence: 0 }
  }
}

// Función auxiliar para comparar bounds
const compareBounds = (bounds1, bounds2) => {
  const area1 = bounds1.size.width * bounds1.size.height
  const area2 = bounds2.size.width * bounds2.size.height
  
  const areaRatio = Math.min(area1, area2) / Math.max(area1, area2)
  
  return areaRatio
}

// Función auxiliar para comparar landmarks
const compareLandmarks = (landmarks1, landmarks2) => {
  if (!landmarks1 || !landmarks2) return 0
  
  let totalDistance = 0
  let pointCount = 0
  
  // Comparar puntos clave de landmarks
  const keyPoints = ['nose', 'leftEye', 'rightEye', 'leftMouth', 'rightMouth']
  
  keyPoints.forEach(point => {
    if (landmarks1[point] && landmarks2[point]) {
      const distance = Math.sqrt(
        Math.pow(landmarks1[point].x - landmarks2[point].x, 2) +
        Math.pow(landmarks1[point].y - landmarks2[point].y, 2)
      )
      totalDistance += distance
      pointCount++
    }
  })
  
  if (pointCount === 0) return 0
  
  const avgDistance = totalDistance / pointCount
  // Convertir distancia a similitud (menor distancia = mayor similitud)
  const similarity = Math.max(0, 1 - (avgDistance / 100))
  
  return similarity
}

// Función para guardar características faciales en la base de datos
export const saveFaceFeatures = async (profileId, faceFeatures) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        face_features: JSON.stringify(faceFeatures)
        // Removido updated_at temporalmente hasta que se agregue la columna
      })
      .eq('id', profileId)

    if (error) {
      throw new Error(`Error saving face features: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Error saving face features:', error)
    throw error
  }
}

// Función para obtener características faciales de un perfil
export const getFaceFeatures = async (profileId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('face_features')
      .eq('id', profileId)
      .single()

    if (error) {
      throw new Error(`Error getting face features: ${error.message}`)
    }

    return data.face_features ? JSON.parse(data.face_features) : null
  } catch (error) {
    console.error('Error getting face features:', error)
    return null
  }
}

// Función para reconocer un rostro entre todos los perfiles
export const recognizeFace = async (imageUri) => {
  try {
    // Extraer características del rostro actual
    const currentFaceFeatures = await extractFaceFeatures(imageUri)
    
    // Obtener todos los perfiles con características faciales
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, face_features')
      .not('face_features', 'is', null)

    if (error) {
      throw new Error(`Error getting profiles: ${error.message}`)
    }

    let bestMatch = null
    let highestConfidence = 0

    // Comparar con cada perfil
    for (const profile of profiles) {
      if (profile.face_features) {
        const storedFeatures = JSON.parse(profile.face_features)
        const comparison = compareFaces(currentFaceFeatures, storedFeatures)
        
        if (comparison.isMatch && comparison.confidence > highestConfidence) {
          bestMatch = {
            profileId: profile.id,
            name: profile.name,
            confidence: comparison.confidence
          }
          highestConfidence = comparison.confidence
        }
      }
    }

    return bestMatch
  } catch (error) {
    console.error('Error recognizing face:', error)
    throw error
  }
}
