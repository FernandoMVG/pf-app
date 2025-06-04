import { useEffect } from "react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { BookOpen, Edit3, Eye, Save, Download, Copy, Loader2 } from "lucide-react"
import { getMarkdownFiles, getMarkdownContent, updateMarkdownContent } from "../services/notes-service"

export function NotesSection() {
  const { toast } = useToast()
  const { getAuthHeaders } = useAuth()
  const [selectedNote, setSelectedNote] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const queryClient = useQueryClient() // Initialize queryClient

  // Fetch markdown files
  const { data: markdownFiles = [], isLoading: isLoadingFiles } = useQuery({
    queryKey: ["markdownFiles"],
    queryFn: () => getMarkdownFiles(getAuthHeaders),
  })

  // Fetch content for selected file
  const {
    data: fileContent,
    isLoading: isLoadingContent,
    error: contentError,  } = useQuery({
    queryKey: ["markdownContent", selectedNote],
    queryFn: () => getMarkdownContent(selectedNote, getAuthHeaders),
    enabled: !!selectedNote,
  })

  const handleNoteSelect = (noteId: string) => {
    setSelectedNote(noteId)
    setIsEditMode(false)
  }

  // Update edited content when file content changes
  useEffect(() => {
    if (fileContent && !isEditMode) {
      setEditedContent(fileContent)
    }
  }, [fileContent, isEditMode])

  const handleEditToggle = () => {
    if (fileContent) {
      setIsEditMode(!isEditMode)
      // If switching from edit mode to view mode without saving, revert changes.
      // If saving is handled by handleSave, this might not be needed or adjusted.
      if (isEditMode) { // Was in edit mode, now switching to view
        setEditedContent(fileContent) // Revert to original content
      }
    }
  }

  const updateMutation = useMutation({
    mutationFn: ({ filename, content }: { filename: string; content: string }) =>
      updateMarkdownContent(filename, content, getAuthHeaders),
    onSuccess: () => {
      toast({
        title: "Apuntes guardados",
        description: "Los cambios han sido guardados exitosamente.",
      })
      setIsEditMode(false)
      // Invalidate and refetch the content to show the updated data
      queryClient.invalidateQueries({ queryKey: ["markdownContent", selectedNote] })
      queryClient.invalidateQueries({ queryKey: ["markdownFiles"] }); // In case filenames or list changes
    },
    onError: (error: any) => {
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudieron guardar los cambios.",
        variant: "destructive",
      })
    },
  })

  const handleSave = async () => {
    if (!selectedNote || !editedContent) {
      toast({
        title: "Nada que guardar",
        description: "No hay contenido editado para guardar.",
        variant: "default",
      })
      return
    }
    updateMutation.mutate({ filename: selectedNote, content: editedContent })
  }

  const handleDownload = () => {
    if (!selectedNote || !editedContent) return

    const blob = new Blob([editedContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = selectedNote
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Archivo descargado",
      description: "Los apuntes han sido descargados como archivo Markdown.",
    })
  }

  const handleCopy = async () => {
    if (!editedContent) return

    await navigator.clipboard.writeText(editedContent)
    toast({
      title: "Contenido copiado",
      description: "Los apuntes han sido copiados al portapapeles.",
    })
  }

  // Simple markdown renderer for preview
  const renderMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2 mt-4">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/\n/gim, "<br>")
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Apuntes de Clase
          </CardTitle>
          <CardDescription className="text-slate-300">
            Visualiza, edita y descarga tus apuntes generados por IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notes Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Selecciona unos apuntes:</label>
            <Select value={selectedNote} onValueChange={handleNoteSelect} disabled={isLoadingFiles}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder={isLoadingFiles ? "Cargando..." : "Elige unos apuntes..."} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {markdownFiles.map((file: string) => (
                  <SelectItem key={file} value={file} className="text-white">
                    <div className="flex flex-col">
                      <span>{file}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes Content */}
          {selectedNote && (
            <div className="space-y-4">
              {isLoadingContent && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-2" />
                  <span className="text-slate-300">Cargando contenido...</span>
                </div>
              )}

              {contentError && (
                <div className="text-center py-8">
                  <p className="text-red-400">Error al cargar el contenido</p>
                </div>
              )}

              {fileContent && !isLoadingContent && (
                <>                  {/* Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h3 className="text-lg font-semibold text-white truncate">{selectedNote}</h3>
                      <div className="flex items-center space-x-2">
                        <Switch id="edit-mode" checked={isEditMode} onCheckedChange={handleEditToggle} />
                        <Label htmlFor="edit-mode" className="text-slate-300 flex items-center text-xs sm:text-sm">
                          {isEditMode ? <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                          {isEditMode ? "Modo Edición" : "Modo Vista"}
                        </Label>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {isEditMode && (
                        <Button
                          onClick={handleSave}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          )}
                          {updateMutation.isPending ? "Guardando..." : "Guardar"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="border-slate-600 text-slate-800 hover:bg-slate-800 text-xs sm:text-sm"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Copiar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="border-slate-600 text-slate-800 hover:bg-slate-800 text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>                  {/* Content Display */}
                  <div className="border border-slate-600 rounded-lg overflow-hidden">
                    {isEditMode ? (
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[400px] sm:min-h-[600px] bg-white text-slate-900 border-0 resize-none font-mono text-xs sm:text-sm"
                        placeholder="Edita tus apuntes aquí..."
                      />
                    ) : (
                      <div className="bg-white text-slate-900 p-3 sm:p-6 min-h-[400px] sm:min-h-[600px] overflow-auto">
                        <div
                          className="prose prose-slate max-w-none text-xs sm:text-sm"
                          dangerouslySetInnerHTML={{
                            __html: `<p class="mb-4">${renderMarkdown(editedContent || fileContent)}</p>`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}          {!selectedNote && (
            <div className="text-center py-8 sm:py-12">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-slate-500" />
              <p className="text-slate-400 text-sm sm:text-base">Selecciona unos apuntes para comenzar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>  )
}