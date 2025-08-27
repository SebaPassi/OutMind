import { supabase } from './supabaseClient'

export const setupStorageBucket = async () => {
  try {
    console.log('🔧 Configurando bucket de storage...')
    
    // Listar buckets existentes
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listando buckets:', listError)
      return false
    }
    
    console.log('📦 Buckets existentes:', buckets.map(b => b.name))
    
    // Verificar si el bucket profile_pictures existe
    const profilePicturesBucket = buckets.find(bucket => bucket.name === 'profile_pictures')
    
    if (!profilePicturesBucket) {
      console.log('📁 Bucket profile_pictures no existe, creándolo...')
      
      // Crear el bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('profile_pictures', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.error('❌ Error creando bucket:', createError)
        return false
      }
      
      console.log('✅ Bucket profile_pictures creado exitosamente:', newBucket)
    } else {
      console.log('✅ Bucket profile_pictures ya existe')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error en setupStorageBucket:', error)
    return false
  }
}

export const checkStoragePermissions = async () => {
  try {
    console.log('🔐 Verificando permisos de storage...')
    
    // Intentar listar archivos en el bucket
    const { data: files, error } = await supabase.storage
      .from('profile_pictures')
      .list()
    
    if (error) {
      console.error('❌ Error verificando permisos:', error)
      return false
    }
    
    console.log('✅ Permisos de storage verificados correctamente')
    console.log('📁 Archivos en bucket:', files.length)
    
    return true
  } catch (error) {
    console.error('❌ Error en checkStoragePermissions:', error)
    return false
  }
}
