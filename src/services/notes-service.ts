import axios from "axios"

// Usar rutas relativas ya que tenemos proxy configurado
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || ""

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

const getFilenameFromResponse = (headers: any, defaultFilename: string) => {
  const contentDisposition = headers["content-disposition"]
  let filename = defaultFilename

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
    if (filenameMatch && filenameMatch.length > 1) {
      filename = filenameMatch[1]
    }
  }
  return filename
}

const handleFileDownload = (response: any, defaultFilename: string) => {
  const contentDisposition = response.headers["content-disposition"]
  let filename = defaultFilename

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
    if (filenameMatch && filenameMatch.length > 1) {
      filename = filenameMatch[1]
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  link.parentNode?.removeChild(link)
  window.URL.revokeObjectURL(url)
  return filename
}

// Función para generar esquema
export const generarEsquema = async (transcriptionFile: File, getAuthHeaders: () => Promise<any>) => {
  try {
    const formData = new FormData()
    formData.append('file', transcriptionFile)
    const headers = await createAuthHeaders(getAuthHeaders, true)

    const response = await axios.post(`${BACKEND_BASE_URL}/api/generar-esquema`, formData, {
      headers,
      withCredentials: true,
      responseType: 'blob'
    })

    const filename = getFilenameFromResponse(response.headers, 'esquema.txt')

    return {
      success: true,
      blob: response.data,
      filename: filename.replace(/"/g, ''),
    }
  } catch (error: any) {
    console.error('Error generating schema:', error)
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
    }
  }
}

// Función para generar esquema con Gemini
export const generarEsquemaGemini = async (transcriptionFile: File, getAuthHeaders: () => Promise<any>) => {
  try {
    const formData = new FormData()
    formData.append('file', transcriptionFile)
    const headers = await createAuthHeaders(getAuthHeaders, true)

    const response = await axios.post(`${BACKEND_BASE_URL}/api/generar_esquema_gemini`, formData, {
      headers,
      withCredentials: true,
      responseType: 'blob'
    })

    const filename = getFilenameFromResponse(response.headers, 'esquema_gemini.txt')

    return {
      success: true,
      blob: response.data,
      filename: filename.replace(/"/g, ''),
    }
  } catch (error: any) {
    console.error('Error generating Gemini schema:', error)
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
    }
  }
}

export const generarApuntes = async (transcripcionFile: File, esquemaFile: File, getAuthHeaders: () => Promise<any>) => {
  if (!transcripcionFile || !esquemaFile) {
    throw new Error("Both transcription and schema files are required for generating notes.")
  }

  const formData = new FormData()
  formData.append("transcripcion_file", transcripcionFile, transcripcionFile.name)
  formData.append("esquema_file", esquemaFile, esquemaFile.name)

  try {
    const headers = await createAuthHeaders(getAuthHeaders, true)
    const response = await axios.post(`${BACKEND_BASE_URL}/api/generar_apuntes`, formData, {
      headers,
      withCredentials: true,
      responseType: "blob",
    })
    const downloadedFilename = handleFileDownload(response, "apuntes.md")
    return { success: true, filename: downloadedFilename }
  } catch (error: any) {
    console.error("Error generating notes:", error.response ? error.response.data : error.message)
    const errorDetails = error.response ? error.response.data : error.message
    throw new Error(`Error generating notes: ${errorDetails}`)
  }
}

export const generarApuntesGemini = async (esquemaFile: File, transcripcionFile: File, getAuthHeaders: () => Promise<any>) => {
  if (!esquemaFile || !transcripcionFile) {
    throw new Error("Both schema and transcription files are required for generating Gemini notes.")
  }

  const formData = new FormData()
  formData.append("esquema_file", esquemaFile, esquemaFile.name)
  formData.append("transcripcion_file", transcripcionFile, transcripcionFile.name)

  try {
    const headers = await createAuthHeaders(getAuthHeaders, true)
    const response = await axios.post(`${BACKEND_BASE_URL}/api/generar_apuntes_gemini`, formData, {
      headers,
      withCredentials: true,
      responseType: "blob",
    })
    const downloadedFilename = handleFileDownload(response, "apuntes_gemini.md")
    return { success: true, filename: downloadedFilename }
  } catch (error: any) {
    console.error("Error generating Gemini notes:", error.response ? error.response.data : error.message)
    const errorDetails = error.response ? error.response.data : error.message
    throw new Error(`Error generating Gemini notes: ${errorDetails}`)
  }
}

export const getMarkdownFiles = async (getAuthHeaders: () => Promise<any>) => {
  try {
    const headers = await createAuthHeaders(getAuthHeaders)
    const response = await axios.get(`${BACKEND_BASE_URL}/api/files/`, {
      headers,
      withCredentials: true,
    })
    return response.data.filenames.filter((f: string) => f.endsWith(".md"))
  } catch (error: any) {
    console.error("Error al obtener archivos markdown:", error.response ? error.response.data : error.message)
    throw error
  }
}

export const getMarkdownContent = async (filename: string, getAuthHeaders: () => Promise<any>) => {
  try {
    const headers = await createAuthHeaders(getAuthHeaders)
    const response = await axios.get(`${BACKEND_BASE_URL}/api/files/${filename}`, {
      headers,
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {
    console.error("Error al obtener contenido markdown:", error.response ? error.response.data : error.message)
    throw error
  }
}

export const updateMarkdownContent = async (filename: string, content: string, getAuthHeaders: () => Promise<any>) => {
  try {
    const headers = await createAuthHeaders(getAuthHeaders) // Content-Type will be application/json by default
    const response = await axios.put(
      `${BACKEND_BASE_URL}/api/guias/${filename}/contenido`,
      { contenido: content },
      {
        headers,
        withCredentials: true,
      }
    )
    return response.data // Or handle success as needed
  } catch (error: any) {
    console.error("Error al actualizar contenido markdown:", error.response ? error.response.data : error.message)
    // Rethrow or return a structured error object
    const errorDetails = error.response ? error.response.data : { message: error.message }
    throw new Error(errorDetails.error || errorDetails.message || "Error al actualizar el archivo.")
  }
}
