import { useState, useCallback, useRef, useEffect } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import Editor from './components/Editor'
import Toolbar from './components/Toolbar'
import FileToolbar from './components/FileToolbar'
import Footer from './components/Footer'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'

import Dashboard from './components/Dashboard'
import { ThemeProvider } from './contexts/ThemeContext'

const editorConfig = {
  namespace: 'MyEditor',
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
    quote:
      'border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 italic text-gray-700 dark:text-gray-400',
    code: 'bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono',
    codeblock: 'bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto',
    horizontalRule: 'my-6 border-gray-300 dark:border-gray-700'
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
    LinkNode,
    HorizontalRuleNode
  ],
  onError: (error) => {
    console.error('Lexical Editor Error:', error)
  }
}

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 175, 200]

function AppContent() {
  const [activeDocument, setActiveDocument] = useState(null)
  const [editorKey, setEditorKey] = useState(Date.now())
  const [lastSaved, setLastSaved] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [initialContent, setInitialContent] = useState('')
  const editorContentRef = useRef('')

  const handleGoToDashboard = useCallback(() => {
    setActiveDocument(null)
    setInitialContent('')
    editorContentRef.current = ''
  }, [])

  const loadDocument = useCallback(async (docId) => {
    try {
      const doc = await window.electron.ipcRenderer.invoke('get-document-content', docId)
      if (doc) {
        setActiveDocument(doc)
        setInitialContent(doc.content || '')
        editorContentRef.current = doc.content || ''
        setLastSaved(new Date(doc.updated_at))
        setEditorKey(Date.now())
      }
    } catch (error) {
      console.error('Failed to load document:', error)
    }
  }, [])

  const handleNewDocument = useCallback(async () => {
    try {
      const newDoc = await window.electron.ipcRenderer.invoke('create-new-document')
      if (newDoc) {
        await loadDocument(newDoc.id)
      }
    } catch (error) {
      console.error('Failed to create new document:', error)
    }
  }, [loadDocument])

  const handleOpenDialog = useCallback(async () => {
    try {
      const doc = await window.electron.ipcRenderer.invoke('open-file-dialog')
      if (doc) {
        await loadDocument(doc.id)
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error)
    }
  }, [loadDocument])

  const handleSaveDocument = useCallback(async () => {
    if (!activeDocument?.id) return
    try {
      const updatedDoc = await window.electron.ipcRenderer.invoke('save-document', {
        id: activeDocument.id,
        content: editorContentRef.current
      })
      if (updatedDoc) {
        setActiveDocument(updatedDoc)
        setLastSaved(new Date(updatedDoc.updated_at))
      }
    } catch (error) {
      console.error('Failed to save document:', error)
    }
  }, [activeDocument?.id])

  const handleSaveAsDocument = useCallback(async () => {
    if (!activeDocument?.id) return
    try {
      const updatedDoc = await window.electron.ipcRenderer.invoke('save-file-as', {
        id: activeDocument.id,
        content: editorContentRef.current
      })
      if (updatedDoc) {
        setActiveDocument(updatedDoc)
        setLastSaved(new Date(updatedDoc.updated_at))
      }
    } catch (error) {
      console.error('Failed to save document as:', error)
    }
  }, [activeDocument?.id])

  useEffect(() => {
    window.electron.ipcRenderer.on('new-document', handleNewDocument)
    window.electron.ipcRenderer.on('open-document', handleOpenDialog)
    window.electron.ipcRenderer.on('save-document', handleSaveDocument)
    window.electron.ipcRenderer.on('save-document-as', handleSaveAsDocument)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('new-document')
      window.electron.ipcRenderer.removeAllListeners('open-document')
      window.electron.ipcRenderer.removeAllListeners('save-document')
      window.electron.ipcRenderer.removeAllListeners('save-document-as')
    }
  }, [handleNewDocument, handleOpenDialog, handleSaveDocument, handleSaveAsDocument])

  const handleRenameDocument = useCallback(
    async (newTitle) => {
      if (!activeDocument?.id) return
      try {
        const updatedDoc = await window.electron.ipcRenderer.invoke('rename-document', {
          id: activeDocument.id,
          newTitle
        })
        if (updatedDoc) {
          setActiveDocument(updatedDoc)
        }
      } catch (error) {
        console.error('Failed to rename document:', error)
      }
    },
    [activeDocument?.id]
  )

  const handleContentChange = useCallback((content) => {
    editorContentRef.current = content
  }, [])

  const increaseZoom = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 10, 200))
  }, [])

  const decreaseZoom = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 10, 50))
  }, [])

  const resetZoom = useCallback(() => {
    setZoomLevel(100)
  }, [])

  const setZoomPreset = useCallback((preset) => {
    setZoomLevel(preset)
  }, [])

  const handleDeleteDocument = useCallback(async () => {
    if (!activeDocument?.id) return

    try {
      const confirmed = window.confirm('Are you sure you want to delete this document?')
      if (!confirmed) return

      await window.electron.ipcRenderer.invoke('delete-document', activeDocument.id)
      setActiveDocument(null)
      editorContentRef.current = ''
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }, [activeDocument?.id])

  if (!activeDocument) {
    return (
      <Dashboard
        onNewDocument={handleNewDocument}
        onOpenRecentDocument={loadDocument}
        onOpenFileDialog={handleOpenDialog}
      />
    )
  }

  return (
    <LexicalComposer key={editorKey} initialConfig={editorConfig}>
      <div className="relative min-h-screen w-full">
        <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex">
          <FileToolbar
            onSave={handleSaveDocument}
            onSaveAs={handleSaveAsDocument}
            onOpen={handleOpenDialog}
            onGoToDashboard={handleGoToDashboard}
          />

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
                      initialContent={activeDocument.content}
                      onContentChange={handleContentChange}
                      zoomLevel={zoomLevel}
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        <Footer
          document={activeDocument}
          lastSaved={lastSaved?.getTime()}
          onRename={handleRenameDocument}
          zoomLevel={zoomLevel}
          onZoomIn={increaseZoom}
          onZoomOut={decreaseZoom}
          onZoomReset={resetZoom}
          onZoomPreset={setZoomPreset}
          presets={ZOOM_PRESETS}
          onDelete={handleDeleteDocument}
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
