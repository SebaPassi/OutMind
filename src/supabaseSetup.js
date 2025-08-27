import { supabase } from './supabaseClient'

// Función para agregar la columna face_features a la tabla profiles
export const setupFaceFeaturesColumn = async () => {
  try {
    console.log('🔧 Configurando columna face_features...')
    
    // Nota: Esta función requiere permisos de administrador en Supabase
    // En producción, esto se haría manualmente en el dashboard de Supabase
    
    console.log('📋 Para agregar la columna face_features:')
    console.log('1. Ve a Supabase Dashboard > Database > Tables')
    console.log('2. Selecciona la tabla "profiles"')
    console.log('3. Haz clic en "Add column"')
    console.log('4. Nombre: face_features')
    console.log('5. Tipo: text')
    console.log('6. Default: null')
    console.log('7. Marca como nullable')
    console.log('8. Haz clic en "Save"')
    
    return true
  } catch (error) {
    console.error('❌ Error setting up face_features column:', error)
    return false
  }
}

// Función para verificar si la columna existe
export const checkFaceFeaturesColumn = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('face_features')
      .limit(1)

    if (error) {
      console.log('❌ Columna face_features no existe:', error.message)
      return false
    }

    console.log('✅ Columna face_features existe')
    return true
  } catch (error) {
    console.error('❌ Error checking face_features column:', error)
    return false
  }
}
