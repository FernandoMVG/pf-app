import axios from "axios"

// Usar rutas relativas ya que tenemos proxy configurado
const BACKEND_PROXY_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
// filepath: src/services/upload-service.ts
console.log("BACKEND_PROXY_URL:", BACKEND_PROXY_URL)
// Función auxiliar para crear headers de autenticación
const createAuthHeaders = async (getAuthHeaders: () => Promise<any>, isFormData = false) => {
  const authHeaders = await getAuthHeaders()
  if (isFormData) {
    // Para FormData, no incluimos Content-Type porque axios lo maneja automáticamente
    const { 'Content-Type': _, ...headersWithoutContentType } = authHeaders
    return headersWithoutContentType
  }
  return authHeaders
}

export const uploadAudio = async (file: File, getAuthHeaders: () => Promise<any>) => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    const headers = await createAuthHeaders(getAuthHeaders, true)
    const response = await axios.post(`${BACKEND_PROXY_URL}/api/audio/upload`, formData, {
      headers,
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {
    console.error("Error al subir el audio:", error.response ? error.response.data : error.message)
    throw error
  }
}

export const getAudioStatus = async (audioId: string, getAuthHeaders: () => Promise<any>) => {
  try {
    const headers = await createAuthHeaders(getAuthHeaders)
    const response = await axios.get(`${BACKEND_PROXY_URL}/api/audio/status/${audioId}`, {
      headers,
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {
    console.error("Error al obtener el estado del audio:", error.response ? error.response.data : error.message)
    throw error
  }
}

export const processAudio = async (audioId: string, getAuthHeaders: () => Promise<any>, options = {}) => {
  try {
    const headers = await createAuthHeaders(getAuthHeaders)
    const response = await axios.post(`${BACKEND_PROXY_URL}/api/audio/process/${audioId}`, options, {
      headers,
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {
    console.error("Error al procesar el audio:", error.response ? error.response.data : error.message)
    throw error
  }
}

export const transcribeAudio = async (audioId: string, getAuthHeaders: () => Promise<any>, options: { use_fallback?: boolean } = {}) => {
  let url = `${BACKEND_PROXY_URL}/api/audio/transcribe/${audioId}`
  const queryParams = new URLSearchParams()
  if (options.use_fallback !== undefined) {
    queryParams.append("use_fallback", options.use_fallback.toString())
  }
  const queryString = queryParams.toString()
  if (queryString) {
    url += `?${queryString}`
  }
  try {
    const headers = await createAuthHeaders(getAuthHeaders)
    const response = await axios.post(url, {}, { headers, withCredentials: true })
    return response.data
  } catch (error: any) {
    console.error("Error al transcribir el audio (frontend):", error.response ? error.response.data : error.message)
    throw error
  }
}

export const cleanupAudio = async (audioId: string, getAuthHeaders: () => Promise<any>) => {
  try {
    const headers = await createAuthHeaders(getAuthHeaders)
    const response = await axios.delete(`${BACKEND_PROXY_URL}/api/audio/cleanup/${audioId}`, {
      headers,
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {
    console.error("Error al limpiar el audio:", error.response ? error.response.data : error.message)
    throw error
  }
}

export const uploadPdfToVectorDB = async (file: File, getAuthHeaders: () => Promise<any>) => {
  try {
    const formData = new FormData()
    formData.append("pdfFile", file)
    const headers = await createAuthHeaders(getAuthHeaders, true)
    const response = await axios.post(`${BACKEND_PROXY_URL}/api/vector-db/upload-pdf`, formData, {
      headers,
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {
    console.error("Error al subir el PDF al vector DB:", error.response ? error.response.data : error.message)
    throw error
  }
}

export const getAudioList = async (getAuthHeaders: () => Promise<any>) => {
  try {
    const headers = await createAuthHeaders(getAuthHeaders)
    const response = await axios.get(`${BACKEND_PROXY_URL}/api/audio/list`, {
      headers,
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {
    console.error("Error al obtener la lista de audios:", error.response ? error.response.data : error.message)
    throw error
  }
}

export const getTranscription = async (audioId: string, getAuthHeaders: () => Promise<any>) => {
  try {
    const headers = await createAuthHeaders(getAuthHeaders)
    const response = await axios.get(`${BACKEND_PROXY_URL}/api/audio/${audioId}/transcription`, {
      headers,
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {
    console.error("Error al obtener la transcripción:", error.response ? error.response.data : error.message)
    throw error
  }
}
