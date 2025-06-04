import { useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Upload, FileAudio, Sparkles, BookOpen, LogIn } from "lucide-react"
import { FileUploadSection } from "./components/file-upload-section"
import { TranscriptionSection } from "./components/transcription-section"
import { NotesSection } from "./components/notes-section"
import { Toaster } from "@/components/ui/toaster"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

function TutorlyAppContent() {
  const [activeTab, setActiveTab] = useState("upload")

  // Efecto para mantener el backend despierto
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${BACKEND_URL}/api/health`)
        .then(res => res.json())
        .then(data => console.log("Backend health:", data))
        .catch(() => { })
    }, 12 * 60 * 1000) // cada 12 minutos
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">TUTORLY</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-500/30 hidden sm:flex">
                <Sparkles className="w-3 h-3 mr-1" />
                IA Activada
              </Badge>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20 text-sm">
                    <LogIn className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                    <span className="sm:hidden">Entrar</span>
                  </Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <SignedIn>
            {/* Welcome Section */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Transforma tus clases en herramientas de{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  aprendizaje inteligente
                </span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto px-4">
                Accede a transcripciones automatizadas, contextualizadas y guías de estudio generadas por IA a partir de
                tus clases.
              </p>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-white/10 mb-6">
                <TabsTrigger
                  value="upload"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200 text-xs sm:text-sm"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Subir Archivos</span>
                  <span className="sm:hidden">Subir</span>
                </TabsTrigger>
                <TabsTrigger
                  value="transcriptions"
                  className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-200 text-xs sm:text-sm"
                >
                  <FileAudio className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Transcripciones</span>
                  <span className="sm:hidden">Audio</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-200 text-xs sm:text-sm"
                >
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Apuntes de Clase</span>
                  <span className="sm:hidden">Apuntes</span>
                </TabsTrigger>
              </TabsList>

              <div className="space-y-6">
                <TabsContent value="upload" className="space-y-6">
                  <FileUploadSection />
                </TabsContent>

                <TabsContent value="transcriptions" className="space-y-6">
                  <TranscriptionSection />
                </TabsContent>

                <TabsContent value="notes" className="space-y-6">
                  <NotesSection />
                </TabsContent>
              </div>
            </Tabs>
          </SignedIn>
          
          <SignedOut>
            {/* Welcome Section for Non-Authenticated Users */}
            <div className="text-center px-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Bienvenido a{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TUTORLY
                </span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
                La plataforma de aprendizaje inteligente que transforma tus clases en herramientas de estudio 
                personalizadas con IA.
              </p>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                  <div className="bg-black/20 border border-white/10 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mb-4 mx-auto" />
                    <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Sube tus archivos</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">Carga grabaciones de audio de tus clases</p>
                  </div>
                  <div className="bg-black/20 border border-white/10 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                    <FileAudio className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mb-4 mx-auto" />
                    <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Transcripciones automáticas</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">Obtén transcripciones precisas con IA</p>
                  </div>
                  <div className="bg-black/20 border border-white/10 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-4 mx-auto" />
                    <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Apuntes inteligentes</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">Genera resúmenes y guías de estudio</p>
                  </div>
                </div>
                <div className="pt-6">
                  <SignInButton mode="modal">
                    <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 sm:px-8 py-3 text-sm sm:text-base">
                      <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Comenzar ahora
                    </Button>
                  </SignInButton>
                </div>
              </div>
            </div>
          </SignedOut>
        </div>
      </main>

      <Toaster />
    </div>
  )
}

export default function TutorlyApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TutorlyAppContent />
    </QueryClientProvider>
  )
}
