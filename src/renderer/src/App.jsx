import { useState, useEffect, useCallback } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import Editor from './components/Editor'
import Toolbar from './components/Toolbar'
import FileToolbar from './components/FileToolbar'
import OutputToolbar from './components/OutputToolbar'
import Footer from './components/Footer'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import Dashboard from './components/Dashboard'
import { ThemeProvider } from './contexts/ThemeContext'

const editorConfig = {
  namespace: 'MyEditor',
  onError: (error) => console.error(error),
  theme: {
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'editor-underline',
      strikethrough: 'line-through',
      underlineStrikethrough: 'editor-underline line-through'
    },
    paragraph: 'mb-4 leading-relaxed dark:text-gray-300',
    heading: {
      h1: 'text-3xl font-bold mb-6 mt-8 text-gray-900 dark:text-gray-100',
      h2: 'text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-gray-100',
      h3: 'text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-gray-100',
      h4: 'text-lg font-bold mb-2 mt-4 text-gray-900 dark:text-gray-100',
      h5: 'text-base font-bold mb-2 mt-3 text-gray-900 dark:text-gray-100',
      h6: 'text-sm font-bold mb-2 mt-2 text-gray-900 dark:text-gray-100'
    },
    list: {
      ol: 'list-decimal ml-6 mb-4 dark:text-gray-300',
      ul: 'list-disc ml-6 mb-4 dark:text-gray-300'
    },
    listitem: 'mb-1',
    quote: 'border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 italic text-gray-700 dark:text-gray-400',
    code: 'bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono',
    codeblock: 'bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto'
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    ListItemNode,
    ListNode,
    TableCellNode,
    TableNode,
    TableRowNode,
    CodeHighlightNode,
    CodeNode,
    AutoLinkNode,
    LinkNode
  ]
}

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 175, 200]

function AppContent() {
  const [activeDocument, setActiveDocument] = useState(null)
  const [key, setKey] = useState(Date.now())
  const [lastSaved, setLastSaved] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(100)

  const handleNewDocument = useCallback(() => {
    setActiveDocument({ id: null, content: '', filePath: null, isNew: true })
    setKey(Date.now())
    setLastSaved(null)
  }, [])

  const handleOpenRecentDocument = useCallback(async (id) => {
    try {
      const doc = await window.electron.ipcRenderer.invoke('get-document', id)
      if (doc) {
        setActiveDocument({
          id: doc.id,
          content: doc.content || '',
          filePath: doc.filePath || null,
          isNew: false
        })
        setKey(Date.now())
        setLastSaved(doc.updatedAt ? new Date(doc.updatedAt) : null)
      }
    } catch (error) {
      console.error('Failed to open recent document:', error)
    }
  }, [])

  useEffect(() => {
    const handleFileOpened = (event, { filePath, data }) => {
      setActiveDocument({
        id: null,
        content: data || '',
        filePath: filePath,
        isNew: false
      })
      setKey(Date.now())
      setLastSaved(null)
    }

    const handleFileSaved = (event, newFilePath) => {
      setActiveDocument((prev) => (prev ? { ...prev, filePath: newFilePath, isNew: false } : null))
      setLastSaved(Date.now())
    }

    const handleFileRenamed = (event, newPath) => {
      setActiveDocument((prev) => (prev ? { ...prev, filePath: newPath } : null))
      setLastSaved(Date.now())
    }

    window.electron.ipcRenderer.on('file-opened', handleFileOpened)
    window.electron.ipcRenderer.on('file-saved', handleFileSaved)
    window.electron.ipcRenderer.on('file-renamed', handleFileRenamed)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('file-opened')
      window.electron.ipcRenderer.removeAllListeners('file-saved')
      window.electron.ipcRenderer.removeAllListeners('file-renamed')
    }
  }, [])

  const increaseZoom = useCallback(() => {
    setZoomLevel((prev) => {
      const currentIndex = ZOOM_PRESETS.findIndex((preset) => preset >= prev)
      if (currentIndex < ZOOM_PRESETS.length - 1) {
        return ZOOM_PRESETS[currentIndex + 1]
      }
      return Math.min(prev + 25, 300)
    })
  }, [])

  const decreaseZoom = useCallback(() => {
    setZoomLevel((prev) => {
      const currentIndex = ZOOM_PRESETS.findIndex((preset) => preset >= prev)
      if (currentIndex > 0) {
        return ZOOM_PRESETS[currentIndex - 1]
      }
      return Math.max(prev - 25, 25)
    })
  }, [])

  const resetZoom = useCallback(() => {
    setZoomLevel(100)
  }, [])

  const setZoomPreset = useCallback((preset) => {
    setZoomLevel(preset)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.code) {
          case 'Equal':
          case 'NumpadAdd':
            event.preventDefault()
            increaseZoom()
            break

          case 'Minus':
          case 'NumpadSubtract':
            event.preventDefault()
            decreaseZoom()
            break

          case 'Digit0':
          case 'Numpad0':
            event.preventDefault()
            resetZoom()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [increaseZoom, decreaseZoom, resetZoom])

  useEffect(() => {
    const handleWheel = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        if (event.deltaY < 0) {
          increaseZoom()
        } else if (event.deltaY > 0) {
          decreaseZoom()
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [increaseZoom, decreaseZoom])

  const initialConfig = {
    ...editorConfig,
    editorState: null
  }

  if (!activeDocument) {
    return (
      <Dashboard
        onNewDocument={handleNewDocument}
        onOpenRecentDocument={handleOpenRecentDocument}
      />
    )
  }

  return (
    <LexicalComposer key={key} initialConfig={initialConfig}>
      <div className="relative min-h-screen w-full">
        <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex">
          <FileToolbar filePath={activeDocument.filePath} />

          <main className="flex-1 flex flex-col min-h-screen overflow-auto relative">
            <div className="flex-1 py-8 px-16 overflow-auto pb-16">
              <div
                className="bg-white dark:bg-gray-800 shadow-2xl mx-auto"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease-out',
                  width: '100%',
                  maxWidth: '1400px',
                  minHeight: '1123px'
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 border border-gray-200 dark:border-gray-700 pointer-events-none"></div>
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <Toolbar />
                  </div>
                  <div className="relative">
                    <Editor
                      key={`editor-${key}`}
                      initialMarkdown={activeDocument.content}
                      zoomLevel={zoomLevel}
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>

          <OutputToolbar />
        </div>
        <Footer
          filePath={activeDocument.filePath}
          lastSaved={lastSaved}
          zoomLevel={zoomLevel}
          onZoomIn={increaseZoom}
          onZoomOut={decreaseZoom}
          onZoomReset={resetZoom}
          onZoomPreset={setZoomPreset}
          presets={ZOOM_PRESETS}
        />
      </div>
    </LexicalComposer>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
