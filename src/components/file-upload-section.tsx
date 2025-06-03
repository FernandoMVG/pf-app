import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { Upload, FileAudio, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import {
  uploadAudio,
  processAudio,
  transcribeAudio,
  getAudioStatus,
  uploadPdfToVectorDB,
} from "../services/upload-service"

interface UploadState {
  audio: {
    file: File | null
    audioId: string | null
    progress: number
    status: "idle" | "uploading" | "processing" | "transcribing" | "completed" | "error"
  }
  document: {
    file: File | null
    progress: number
    status: "idle" | "uploading" | "completed" | "error"
  }
}

export function FileUploadSection() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { getAuthHeaders } = useAuth()
  const [uploadState, setUploadState] = useState<UploadState>({
    audio: { file: null, audioId: null, progress: 0, status: "idle" },
    document: { file: null, progress: 0, status: "idle" },
  })
  const [useAlternativeModel, setUseAlternativeModel] = useState(false)

  const audioUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Upload
      setUploadState((prev) => ({
        ...prev,
        audio: { ...prev.audio, status: "uploading", progress: 25 },
      }))

      const uploadResult = await uploadAudio(file, getAuthHeaders)
      const audioId = uploadResult.audio_id

      setUploadState((prev) => ({
        ...prev,
        audio: { ...prev.audio, audioId, status: "processing", progress: 50 },
      }))      // Step 2: Process
      const processParams = {
        target_sr: 16000,
        gain_db: 5,
        segment_min: 15,
        overlap_sec: 30,
        do_noise_reduction: true,
        do_segmentation: true,
      }

      const processResult = await processAudio(audioId, getAuthHeaders, processParams)

      // Step 3: Wait for processing if needed
      if (processResult.processing_status !== "completed" && processResult.processing_status !== "processed") {
        await new Promise<void>((resolve, reject) => {
          const interval = setInterval(async () => {
            try {
              const statusResult = await getAudioStatus(audioId, getAuthHeaders)
              if (statusResult.processing_status === "completed" || statusResult.processing_status === "processed") {
                clearInterval(interval)
                resolve()
              } else if (statusResult.processing_status === "failed") {
                clearInterval(interval)
                reject(new Error(statusResult.error || "Processing failed"))
              }
            } catch (error) {
              clearInterval(interval)
              reject(error)
            }
          }, 2000)
        })
      }

      setUploadState((prev) => ({
        ...prev,
        audio: { ...prev.audio, status: "transcribing", progress: 75 },
      }))

      // Step 4: Transcribe
      const transcriptionResult = await transcribeAudio(audioId, getAuthHeaders, { use_fallback: useAlternativeModel })

      setUploadState((prev) => ({
        ...prev,
        audio: { ...prev.audio, status: "completed", progress: 100 },
      }))

      return { audioId, transcriptionResult }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audioList"] })
      toast({
        title: "Audio procesado exitosamente",
        description: "Tu transcripción está lista para usar.",
      })
    },
    onError: (error: any) => {
      setUploadState((prev) => ({
        ...prev,
        audio: { ...prev.audio, status: "error" },
      }))
      toast({
        title: "Error al procesar audio",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      })
    },
  })

  const documentUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadState((prev) => ({
        ...prev,
        document: { ...prev.document, status: "uploading", progress: 50 },
      }))

      const result = await uploadPdfToVectorDB(file, getAuthHeaders)

      setUploadState((prev) => ({
        ...prev,
        document: { ...prev.document, status: "completed", progress: 100 },
      }))

      return result
    },
    onSuccess: (data) => {
      toast({
        title: "Documento procesado exitosamente",
        description: data.message || "Tu documento ha sido añadido a la base de conocimiento.",
      })
    },
    onError: (error: any) => {
      setUploadState((prev) => ({
        ...prev,
        document: { ...prev.document, status: "error" },
      }))
      toast({
        title: "Error al procesar documento",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      })
    },
  })

  const handleFileSelect = (type: "audio" | "document") => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = type === "audio" ? "audio/*" : ".pdf,.txt,.doc,.docx"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (type === "audio") {
          setUploadState((prev) => ({
            ...prev,
            audio: { ...prev.audio, file, status: "idle", progress: 0 },
          }))
        } else {
          setUploadState((prev) => ({
            ...prev,
            document: { ...prev.document, file, status: "idle", progress: 0 },
          }))
        }
      }
    }
    input.click()
  }

  const handleStartProcessing = async () => {
    if (!uploadState.audio.file) {
      toast({
        title: "Error",
        description: "Debes subir un archivo de audio primero.",
        variant: "destructive",
      })
      return
    }

    const promises = []

    if (uploadState.audio.file) {
      promises.push(audioUploadMutation.mutateAsync(uploadState.audio.file))
    }

    if (uploadState.document.file) {
      promises.push(documentUploadMutation.mutateAsync(uploadState.document.file))
    }

    try {
      await Promise.all(promises)
    } catch (error) {
      // Errors are handled by individual mutations
    }
  }

  const handleClearFiles = () => {
    setUploadState({
      audio: { file: null, audioId: null, progress: 0, status: "idle" },
      document: { file: null, progress: 0, status: "idle" },
    })
  }

  const getStatusIcon = (status: UploadState["audio"]["status"]) => {
    switch (status) {
      case "uploading":
      case "processing":
      case "transcribing":
        return <Loader2 className="w-4 h-4 animate-spin" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: UploadState["audio"]["status"]) => {
    switch (status) {
      case "uploading":
        return "Subiendo..."
      case "processing":
        return "Procesando..."
      case "transcribing":
        return "Transcribiendo..."
      case "completed":
        return "Completado"
      case "error":
        return "Error"
      default:
        return ""
    }
  }

  const isProcessing =
    audioUploadMutation.isPending ||
    documentUploadMutation.isPending ||
    uploadState.audio.status === "processing" ||
    uploadState.audio.status === "transcribing"
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-black/20 border-white/10">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-white flex items-center text-lg sm:text-xl">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Sistema de Transcripción de Audio
          </CardTitle>
          <CardDescription className="text-slate-300 text-sm sm:text-base">
            Sube, procesa y transcribe tus archivos de audio fácilmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* File Upload Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Audio Upload */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-white">1. Cargar Audio</h3>
              <div
                onClick={() => !isProcessing && handleFileSelect("audio")}
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
                  isProcessing
                    ? "border-slate-700 bg-slate-800/30 cursor-not-allowed"
                    : "border-slate-600 hover:border-slate-500 bg-slate-800/50 cursor-pointer hover:bg-blue-500/10"
                }`}
              >
                <FileAudio className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-3 sm:mb-4 text-blue-400" />
                <p className="text-white font-medium mb-2 text-sm sm:text-base break-words">
                  {uploadState.audio.file ? uploadState.audio.file.name : "Arrastra o selecciona audio"}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm">MP3, WAV, M4A, etc.</p>
              </div>

              {uploadState.audio.status !== "idle" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-300 flex items-center">
                      {getStatusIcon(uploadState.audio.status)}
                      <span className="ml-2">{getStatusText(uploadState.audio.status)}</span>
                    </span>
                    <span className="text-slate-400">{Math.round(uploadState.audio.progress)}%</span>
                  </div>
                  <Progress value={uploadState.audio.progress} className="h-2" />
                </div>
              )}
            </div>

            {/* Document Upload */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-white">2. Subir Documento (Opcional)</h3>
              <div
                onClick={() => !isProcessing && handleFileSelect("document")}
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
                  isProcessing
                    ? "border-slate-700 bg-slate-800/30 cursor-not-allowed"
                    : "border-slate-600 hover:border-slate-500 bg-slate-800/50 cursor-pointer hover:bg-purple-500/10"
                }`}
              >
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-3 sm:mb-4 text-purple-400" />
                <p className="text-white font-medium mb-2 text-sm sm:text-base break-words">
                  {uploadState.document.file ? uploadState.document.file.name : "Subir documento (Opcional)"}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm">PDF, TXT, DOC</p>
              </div>

              {uploadState.document.status !== "idle" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300 flex items-center">
                      {getStatusIcon(uploadState.document.status)}
                      <span className="ml-2">{getStatusText(uploadState.document.status)}</span>
                    </span>
                    <span className="text-slate-400">{Math.round(uploadState.document.progress)}%</span>
                  </div>
                  <Progress value={uploadState.document.progress} className="h-2" />
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-2 p-4 bg-slate-800/50 rounded-lg">
            <Switch
              id="alternative-model"
              checked={useAlternativeModel}
              onCheckedChange={setUseAlternativeModel}
              disabled={isProcessing}
            />
            <Label htmlFor="alternative-model" className="text-slate-300">
              Usar Modelo Alterno (Mayor precisión, más lento)
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              onClick={handleStartProcessing}
              disabled={!uploadState.audio.file || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Iniciar Transcripción
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleClearFiles}
              disabled={isProcessing}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancelar y Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>  )
}