import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { FileAudio, Copy, Download, Sparkles, Loader2 } from "lucide-react"
import { getAudioList, getTranscription } from "../services/upload-service"
import { generarEsquema, generarEsquemaGemini, generarApuntes, generarApuntesGemini } from "../services/notes-service"

export function TranscriptionSection() {
  const { toast } = useToast()
  const { getAuthHeaders } = useAuth()
  const [selectedAudioId, setSelectedAudioId] = useState<string>("")
  const [studyGuideMode, setStudyGuideMode] = useState<"estandar" | "gemini">("estandar")

  // Fetch audio list
  const { data: audioList = [], isLoading: isLoadingAudioList } = useQuery({
    queryKey: ["audioList"],
    queryFn: () => getAudioList(getAuthHeaders),
  })

  // Fetch transcription for selected audio
  const {
    data: transcriptionData,
    isLoading: isLoadingTranscription,
    error: transcriptionError,
  } = useQuery({
    queryKey: ["transcription", selectedAudioId],
    queryFn: () => getTranscription(selectedAudioId, getAuthHeaders),
    enabled: !!selectedAudioId,
  })

  // Generate study guide mutation
  const generateStudyGuideMutation = useMutation({
    mutationFn: async () => {
      if (!transcriptionData) throw new Error("No transcription available")      // Create transcription file
      const fullText = transcriptionData.segments
        ? transcriptionData.segments.map((segment: any) => segment.transcription).join("\\n")
        : transcriptionData.complete_transcription

      const transcriptionBlob = new Blob([fullText], { type: "text/plain;charset=utf-8" })
      const transcriptionFile = new File([transcriptionBlob], "transcription.txt", {
        type: "text/plain;charset=utf-8",
      })

      // Step 1: Generate schema
      let schemaResponse
      if (studyGuideMode === "gemini") {
        schemaResponse = await generarEsquemaGemini(transcriptionFile, getAuthHeaders)
      } else {
        schemaResponse = await generarEsquema(transcriptionFile, getAuthHeaders)
      }

      if (!schemaResponse.success || !schemaResponse.blob) {
        throw new Error("Error al generar el esquema.")
      }

      const schemaFile = new File([schemaResponse.blob], schemaResponse.filename || "esquema.txt", {
        type: "text/plain;charset=utf-8",
      })

      // Step 2: Generate notes
      let notesResponse
      if (studyGuideMode === "estandar") {
        notesResponse = await generarApuntes(transcriptionFile, schemaFile, getAuthHeaders)
      } else {
        notesResponse = await generarApuntesGemini(schemaFile, transcriptionFile, getAuthHeaders)
      }

      if (!notesResponse.success) {
        throw new Error("Error al generar los apuntes.")
      }

      return notesResponse
    },
    onSuccess: (data) => {
      toast({
        title: "Apuntes generados exitosamente",
        description: `Tu guía de estudio "${data.filename}" ha sido descargada.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar apuntes",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      })
    },
  })

  const selectedAudio = audioList.find((audio: any) => audio.audioId === selectedAudioId)

  const handleCopyText = async () => {
    if (!transcriptionData) return

    const fullText = transcriptionData.segments
      ? transcriptionData.segments.map((segment: any) => segment.transcription).join("\n")
      : transcriptionData.complete_transcription

    await navigator.clipboard.writeText(fullText)
    toast({
      title: "Texto copiado",
      description: "La transcripción ha sido copiada al portapapeles.",
    })
  }

  const handleExportText = () => {
    if (!transcriptionData || !selectedAudio) return

    const fullText = transcriptionData.segments
      ? transcriptionData.segments.map((segment: any) => segment.transcription).join("\n")
      : transcriptionData.complete_transcription

    const blob = new Blob([fullText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedAudio.originalName || selectedAudio.filename}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Archivo descargado",
      description: "La transcripción ha sido descargada como archivo de texto.",
    })
  }

  const getDisplayText = () => {
    if (!transcriptionData) return ""

    if (transcriptionData.segments && transcriptionData.segments.length > 0) {
      return transcriptionData.segments.map((segment: any) => segment.transcription).join("\n")
    }

    return transcriptionData.complete_transcription || ""
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileAudio className="w-5 h-5 mr-2" />
            Transcripciones de Clase
          </CardTitle>
          <CardDescription className="text-slate-300">
            Selecciona una transcripción para ver su contenido y generar apuntes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Selecciona una transcripción:</label>
            <Select value={selectedAudioId} onValueChange={setSelectedAudioId} disabled={isLoadingAudioList}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder={isLoadingAudioList ? "Cargando..." : "Elige una transcripción..."} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {audioList.map((audio: any) => (
                  <SelectItem key={audio.audioId} value={audio.audioId} className="text-white">
                    <div className="flex flex-col">
                      <span>{audio.originalName || audio.filename}</span>
                      <span className="text-xs text-slate-400">ID: {audio.audioId}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transcription Content */}
          {selectedAudioId && (
            <div className="space-y-4">              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white truncate">
                  {selectedAudio?.originalName || selectedAudio?.filename || "Transcripción"}
                </h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyText}
                    disabled={!transcriptionData || isLoadingTranscription}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 text-xs sm:text-sm"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Copiar texto</span>
                    <span className="sm:hidden">Copiar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportText}
                    disabled={!transcriptionData || isLoadingTranscription}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Exportar como .txt</span>
                    <span className="sm:hidden">Exportar</span>
                  </Button>
                </div>
              </div>

              {isLoadingTranscription && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-2" />
                  <span className="text-slate-300">Cargando transcripción...</span>
                </div>
              )}

              {transcriptionError && (
                <div className="text-center py-8">
                  <p className="text-red-400">Error al cargar la transcripción</p>
                </div>
              )}

              {transcriptionData && !isLoadingTranscription && (
                <>                  <Textarea
                    value={getDisplayText()}
                    readOnly
                    className="min-h-[300px] sm:min-h-[400px] bg-slate-800/50 border-slate-600 text-slate-200 resize-none text-sm"
                    placeholder="El contenido de la transcripción aparecerá aquí..."
                  />                  {/* Study Guide Generation */}
                  <div className="space-y-4 p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                    <h4 className="text-white font-medium text-sm sm:text-base">Generar Apuntes de Clase</h4>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="study-guide-mode"
                          checked={studyGuideMode === "gemini"}
                          onCheckedChange={(checked) => setStudyGuideMode(checked ? "gemini" : "estandar")}
                          disabled={generateStudyGuideMutation.isPending}
                        />
                        <Label htmlFor="study-guide-mode" className="text-slate-300 text-xs sm:text-sm">
                          {studyGuideMode === "gemini" ? "Apuntes con IA (Gemini)" : "Apuntes Estándar"}
                        </Label>
                      </div>
                    </div>

                    <Button
                      onClick={() => generateStudyGuideMutation.mutate()}
                      disabled={generateStudyGuideMutation.isPending}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm"
                    >
                      {generateStudyGuideMutation.isPending ? (
                        <>
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                          <span className="hidden sm:inline">Generando apuntes...</span>
                          <span className="sm:hidden">Generando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">Generar Apuntes de Clase</span>
                          <span className="sm:hidden">Generar Apuntes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}          {!selectedAudioId && (
            <div className="text-center py-8 sm:py-12">
              <FileAudio className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-slate-500" />
              <p className="text-slate-400 text-sm sm:text-base">Selecciona una transcripción para comenzar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TranscriptionSection;