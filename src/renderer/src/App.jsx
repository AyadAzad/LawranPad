import { useState, useEffect } from 'react'
import Editor from './components/Editor'

export default function App() {
  const [filePath, setFilePath] = useState(null)
  const [initialContent, setInitialContent] = useState('')
  const [key, setKey] = useState(Date.now())

  useEffect(() => {
    const handleFileOpened = (event, { filePath, data }) => {
      setFilePath(filePath)
      setInitialContent(data)
      setKey(Date.now()) // Remounts the editor with new content
    }

    const handleFileSaved = (event, newFilePath) => {
      setFilePath(newFilePath)
    }

    window.electron.ipcRenderer.on('file-opened', handleFileOpened)
    window.electron.ipcRenderer.on('file-saved', handleFileSaved)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('file-opened')
      window.electron.ipcRenderer.removeAllListeners('file-saved')
    }
  }, [])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex">
      {/* Main content area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Editor area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div className="w-full max-w-5xl h-full flex items-center justify-center">
            <Editor key={key} initialContent={initialContent} filePath={filePath} />
          </div>
        </div>
      </main>
    </div>
  )
}
