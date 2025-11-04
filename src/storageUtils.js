import { supabase } from './supabaseClient'

/**
 * Upload a profile picture to Supabase Storage
 * @param {string} uri - Local URI of the image
 * @param {string} bucketName - Name of the storage bucket (default: 'profile_pictures')
 * @returns {Promise<string>} - Public URL of the uploaded image
 */
export const uploadProfilePicture = async (uri, bucketName = 'profile_pictures') => {
  try {
    // Convert URI to blob
    const response = await fetch(uri)
    const blob = await response.blob()
    
    // Generate unique filename
    const fileName = generateFileName(uri)
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw new Error('Failed to upload image to storage')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    return urlData.publicUrl

  } catch (error) {
    console.error('Upload error:', error)
    throw new Error('Failed to upload image')
  }
}

/**
 * Delete a profile picture from Supabase Storage
 * @param {string} fileName - Name of the file to delete
 * @param {string} bucketName - Name of the storage bucket (default: 'profile_pictures')
 * @returns {Promise<boolean>} - Success status
 */
export const deleteProfilePicture = async (fileName, bucketName = 'profile_pictures') => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName])

    if (error) {
      console.error('Storage delete error:', error)
      throw new Error('Failed to delete image from storage')
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    throw new Error('Failed to delete image')
  }
}

/**
 * Generate a unique filename for profile pictures
 * @param {string} uri - Original image URI
 * @returns {string} - Unique filename
 */
export const generateFileName = (uri) => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = uri.split('.').pop() || 'jpg'
  return `profile_${timestamp}_${randomString}.${extension}`
}

/**
 * Get the file path from a Storage URL
 * @param {string} url - Storage public URL
 * @returns {string} - File path
 */
export const getFilePathFromUrl = (url) => {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    return pathParts[pathParts.length - 1]
  } catch (error) {
    console.error('Error parsing URL:', error)
    return null
  }
}

/**
 * Update profile picture (delete old, upload new)
 * @param {string} oldImageUrl - URL of the old image
 * @param {string} newImageUri - URI of the new image
 * @param {string} bucketName - Name of the storage bucket (default: 'profile_pictures')
 * @returns {Promise<string>} - Public URL of the new image
 */
export const updateProfilePicture = async (oldImageUrl, newImageUri, bucketName = 'profile_pictures') => {
  try {
    // Delete old image if it exists
    if (oldImageUrl) {
      const oldFileName = getFilePathFromUrl(oldImageUrl)
      if (oldFileName) {
        await deleteProfilePicture(oldFileName, bucketName)
      }
    }

    // Upload new image
    const newImageUrl = await uploadProfilePicture(newImageUri, bucketName)
    return newImageUrl

  } catch (error) {
    console.error('Update profile picture error:', error)
    throw new Error('Failed to update profile picture')
  }
}
