import { supabase } from '../supabaseClient'

/**
 * Busca el perfil asociado a un ArUco ID
 * @param {number} arucoId - ID del ArUco (100, 200, 300, etc.)
 * @returns {Promise<Object|null>} - Perfil asociado o null si no se encuentra
 */
export const getProfileByAruco = async (arucoId) => {
  try {
    const { data, error } = await supabase
      .from('aruco_mappings')
      .select(`
        aruco_id,
        profile_id,
        profiles (
          id,
          name,
          age,
          profile_picture
        )
      `)
      .eq('aruco_id', arucoId)
      .single()

    if (error) {
      console.error('Error fetching profile by ArUco:', error)
      return null
    }

    if (!data || !data.profiles) {
      return null
    }

    return {
      arucoId: data.aruco_id,
      profile: data.profiles
    }
  } catch (error) {
    console.error('Error in getProfileByAruco:', error)
    return null
  }
}

/**
 * Obtiene las tareas del día actual para un perfil específico
 * @param {number} profileId - ID del perfil
 * @returns {Promise<Array>} - Array de tareas del día actual
 */
export const getTodayTasks = async (profileId) => {
  try {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const day = today.getDate()

    // Rango de fechas para el día actual
    const startDate = new Date(year, month, day, 0, 0, 0).toISOString()
    const endDate = new Date(year, month, day, 23, 59, 59).toISOString()

    // Consultar tareas únicas (one-time) para el día actual y el perfil específico
    const { data: oneTimeTasks, error: oneTimeError } = await supabase
      .from('tasks')
      .select(`
        id,
        name,
        description,
        due_date,
        type,
        user_tasks!inner(
          id,
          status,
          assigned_at,
          profiles!inner(
            id,
            name
          )
        )
      `)
      .eq('type', 'one-time')
      .eq('user_tasks.profiles.id', profileId)
      .gte('due_date', startDate)
      .lte('due_date', endDate)

    if (oneTimeError) {
      console.error('Error loading one-time tasks:', oneTimeError)
    }

    // Consultar tareas recurrentes que coincidan con el día de la semana y el perfil
    const dayOfWeek = today.getDay()
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const currentDayName = dayNames[dayOfWeek]

    const { data: recurringTasks, error: recurringError } = await supabase
      .from('tasks')
      .select(`
        id,
        name,
        description,
        frequency,
        type,
        user_tasks!inner(
          id,
          status,
          assigned_at,
          profiles!inner(
            id,
            name
          )
        )
      `)
      .eq('type', 'recurring')
      .eq('user_tasks.profiles.id', profileId)
      .or(`frequency.eq.Todos los días,frequency.eq.${currentDayName}`)

    if (recurringError) {
      console.error('Error loading recurring tasks:', recurringError)
    }

    // Procesar y combinar las tareas
    const allTasks = []

    // Procesar tareas únicas
    if (oneTimeTasks) {
      oneTimeTasks.forEach(task => {
        const dueDate = new Date(task.due_date)
        const timeString = dueDate.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })

        // Solo procesar si está asignada al perfil específico
        task.user_tasks.forEach(userTask => {
          if (userTask.profiles.id === profileId) {
            allTasks.push({
              id: `${task.id}-${userTask.id}`,
              name: task.name,
              description: task.description,
              time: timeString,
              type: 'one-time',
              status: userTask.status,
              dueDate: task.due_date
            })
          }
        })
      })
    }

    // Procesar tareas recurrentes
    if (recurringTasks) {
      recurringTasks.forEach(task => {
        // Solo procesar si está asignada al perfil específico
        task.user_tasks.forEach(userTask => {
          if (userTask.profiles.id === profileId) {
            allTasks.push({
              id: `${task.id}-${userTask.id}`,
              name: task.name,
              description: task.description,
              frequency: task.frequency,
              type: 'recurring',
              status: userTask.status,
              time: null // Las tareas recurrentes no tienen hora específica por defecto
            })
          }
        })
      })
    }

    // Ordenar por hora (tareas con hora primero)
    allTasks.sort((a, b) => {
      if (a.time && !b.time) return -1
      if (!a.time && b.time) return 1
      if (a.time && b.time) return a.time.localeCompare(b.time)
      return 0
    })

    return allTasks
  } catch (error) {
    console.error('Error in getTodayTasks:', error)
    return []
  }
}

