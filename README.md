# 🎓 TUTORLY

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
</div>

<div align="center">
  <h3>🚀 Transforma tus clases en herramientas de aprendizaje inteligente</h3>
  <p>Una plataforma de aprendizaje que utiliza IA para generar transcripciones automatizadas y guías de estudio personalizadas a partir de grabaciones de audio de clases.</p>
</div>

---

## ✨ Características Principales

### 🎵 **Transcripción Inteligente**
- **Subida de Audio**: Soporte para múltiples formatos (MP3, WAV, M4A)
- **Procesamiento Avanzado**: Reducción de ruido y segmentación automática
- **Transcripción con IA**: Modelos estándar y alternativos de alta precisión
- **Exportación**: Descarga transcripciones en formato texto

### 📚 **Generación de Apuntes**
- **Esquemas Automáticos**: Generación de estructuras organizadas
- **Apuntes Estándar**: Resúmenes estructurados y completos
- **Apuntes con Gemini AI**: Contenido enriquecido con inteligencia artificial avanzada
- **Formato Markdown**: Apuntes editables y bien formateados

### 📖 **Gestión de Documentos**
- **Carga de PDFs**: Integración con base de conocimiento vectorial
- **Editor Integrado**: Modo vista y edición para apuntes
- **Búsqueda Inteligente**: Acceso rápido a contenido generado

### 🔐 **Seguridad y Autenticación**
- **Clerk Auth**: Sistema de autenticación robusto
- **Gestión de Usuarios**: Perfiles y sesiones seguras
- **Protección de Rutas**: Acceso controlado a funcionalidades

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **⚛️ React 19.1.0** - Biblioteca de interfaz de usuario
- **📘 TypeScript 5.8.3** - Tipado estático y desarrollo escalable
- **⚡ Vite 6.3.5** - Build tool y desarrollo rápido
- **🎨 Tailwind CSS 3.4.17** - Framework de estilos utilitarios
- **🧩 Radix UI** - Componentes accesibles y customizables

### **Gestión de Estado y Datos**
- **🔄 TanStack Query** - Gestión de estado del servidor
- **📡 Axios** - Cliente HTTP para APIs

### **Autenticación**
- **🔐 Clerk** - Plataforma de autenticación completa

### **Herramientas de Desarrollo**
- **📋 ESLint** - Linting y calidad de código
- **💨 PostCSS** - Procesamiento de CSS
- **🔧 Autoprefixer** - Compatibilidad de navegadores

---

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Backend API configurado

### **Instalación**

1. **Clona el repositorio**
```bash
git clone [tu-repositorio]
cd tutorly-app
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=tu_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:3000
```

4. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

5. **Accede a la aplicación**
```
http://localhost:5173
```

---

## 📖 Uso de la Aplicación

### **1. 📤 Subir Archivos**
- Arrastra o selecciona archivos de audio
- Opcionalmente, añade documentos PDF para contexto
- Configura opciones de procesamiento
- Inicia la transcripción

### **2. 🎧 Gestionar Transcripciones**
- Visualiza el contenido transcrito
- Copia texto al portapapeles
- Exporta como archivo de texto
- Genera apuntes automáticamente

### **3. 📝 Trabajar con Apuntes**
- Visualiza apuntes generados por IA
- Edita contenido en tiempo real
- Descarga en formato Markdown
- Organiza tu material de estudio

---

## 🏗️ Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes de interfaz base
│   ├── file-upload-section.tsx
│   ├── transcription-section.tsx
│   └── notes-section.tsx
├── hooks/               # Custom hooks
│   ├── use-toast.ts
│   └── useAuth.ts
├── services/            # Servicios de API
│   ├── upload-service.ts
│   └── notes-service.ts
├── lib/                 # Utilidades
│   └── utils.ts
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada
```

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Construcción
npm run build        # Construye para producción

# Linting
npm run lint         # Ejecuta ESLint

# Vista previa
npm run preview      # Previsualiza build de producción
```

---

## 🌟 Características Técnicas

### **Responsive Design**
- Diseño móvil-first
- Adaptación automática a diferentes tamaños de pantalla
- Componentes optimizados para touch

### **Accesibilidad**
- Componentes Radix UI con soporte ARIA
- Navegación por teclado
- Contraste de colores optimizado

### **Performance**
- Code splitting automático con Vite
- Lazy loading de componentes
- Optimización de imágenes y assets

### **Desarrollo**
- Hot Module Replacement (HMR)
- TypeScript para type safety
- ESLint para calidad de código

---

## 🤝 Contribución

1. **Fork el proyecto**
2. **Crea una rama para tu feature** (`git checkout -b feature/AmazingFeature`)
3. **Commit tus cambios** (`git commit -m 'Add some AmazingFeature'`)
4. **Push a la rama** (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 📞 Soporte

¿Tienes preguntas o necesitas ayuda? 

- 🐛 **Issues**: [GitHub Issues](link-a-issues)

---

<div align="center">
  <p>Hecho con ❤️ para la educación del futuro</p>
  <p><strong>TUTORLY</strong> - Transformando la forma de aprender</p>
</div>
