import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY
})

/**
 * Genera un mensaje de recordatorio personalizado usando Anthropic Claude
 * @param {string} personName - Nombre de la persona
 * @param {Array} tasks - Array de tareas del día
 * @param {Object} context - Contexto adicional (hora actual, etc.)
 * @returns {Promise<string>} - Mensaje generado en español
 */
export const generateReminderMessage = async (personName, tasks, context = {}) => {
  try {
    const currentHour = context.currentHour || new Date().getHours()
    const currentTime = context.currentTime || new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    // Construir descripción de tareas
    let tasksDescription = ''
    if (!tasks || tasks.length === 0) {
      tasksDescription = 'No tienes tareas programadas para hoy.'
    } else {
      tasksDescription = `Tienes ${tasks.length} ${tasks.length === 1 ? 'tarea' : 'tareas'} programadas para hoy:\n`
      tasks.forEach((task, index) => {
        const timeInfo = task.time ? ` a las ${task.time}` : ''
        const typeInfo = task.type === 'recurring' ? ` (${task.frequency})` : ''
        tasksDescription += `${index + 1}. ${task.name}${timeInfo}${typeInfo}\n`
        if (task.description) {
          tasksDescription += `   ${task.description}\n`
        }
      })
    }

    // Determinar urgencia basada en la hora y las tareas próximas
    let urgency = 'normal'
    const nextHour = currentHour + 1
    const urgentTasks = tasks.filter(task => {
      if (!task.time) return false
      const [hours, minutes] = task.time.split(':').map(Number)
      return hours >= currentHour && hours <= nextHour
    })

    if (urgentTasks.length > 0) {
      urgency = 'alta'
    } else if (tasks.length > 3) {
      urgency = 'media'
    }

    // Construir el prompt para Claude
    const systemPrompt = `Eres un asistente virtual amigable que ayuda a recordar tareas y eventos importantes a miembros de una familia. 
Tu tono debe ser cálido, natural y conversacional, como si fueras parte de la familia. Hablas en español de manera casual pero respetuosa.
Genera mensajes cortos y directos que suenen naturales al hablarse en voz alta.`

    const userPrompt = `Genera un mensaje de recordatorio personalizado para ${personName}.

Contexto:
- Hora actual: ${currentTime}
- Urgencia: ${urgency}
- Número de tareas: ${tasks.length}

${tasksDescription}

El mensaje debe:
1. Comenzar saludando a ${personName} de manera natural
2. Mencionar de forma concisa las tareas más importantes
3. Si hay tareas próximas (próxima hora), mencionarlas con más énfasis
4. Ser natural para hablarse en voz alta
5. Tener entre 20 y 60 palabras aproximadamente
6. Ser cálido y motivador, no alarmante

Ejemplo de formato:
"${personName}, recuerda que hoy tienes [tarea importante] a las [hora]. No olvides [otra tarea]."

Genera solo el mensaje, sin comillas ni explicaciones adicionales.`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Modelo más rápido y económico
      max_tokens: 150,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    // Extraer el texto de la respuesta
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    // Limpiar el mensaje (remover comillas extra si las hay)
    let cleanMessage = responseText.trim()
    if (cleanMessage.startsWith('"') && cleanMessage.endsWith('"')) {
      cleanMessage = cleanMessage.slice(1, -1)
    }
    if (cleanMessage.startsWith("'") && cleanMessage.endsWith("'")) {
      cleanMessage = cleanMessage.slice(1, -1)
    }

    return cleanMessage || `${personName}, recuerda tus tareas del día.`
  } catch (error) {
    console.error('Error generating reminder message:', error)
    
    // Mensaje de fallback si la API falla
    if (!tasks || tasks.length === 0) {
      return `${personName}, no tienes tareas programadas para hoy.`
    }
    
    const tasksText = tasks.slice(0, 2).map(task => {
      const timeInfo = task.time ? ` a las ${task.time}` : ''
      return `${task.name}${timeInfo}`
    }).join(' y ')
    
    return `${personName}, recuerda que hoy tienes ${tasksText}.`
  }
}

