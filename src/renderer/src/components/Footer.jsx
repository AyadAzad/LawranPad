import { useState, useEffect, useRef } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot } from 'lexical'

const Footer = ({
  filePath,
  lastSaved,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomPreset,
  presets = [50, 75, 100, 125, 150, 200]
}) => {
  const [editor] = useLexicalComposerContext()
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [lastSavedText, setLastSavedText] = useState('Not saved')
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const fileName = filePath ? filePath.split(/[\\/]/).pop() : 'Untitled'
  const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '')

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent()
        const words = text.trim().split(/\s+/).filter(Boolean)
        setWordCount(words.length)
        setCharCount(text.length)
      })
    })
    return () => unregister()
  }, [editor])

  useEffect(() => {
    if (lastSaved) {
      const updateLastSavedText = () => {
        const now = new Date()
        const savedDate = new Date(lastSaved)
        const diffInSeconds = Math.floor((now - savedDate) / 1000)

        if (diffInSeconds < 60) {
          setLastSavedText('Just now')
        } else if (diffInSeconds < 3600) {
          const minutes = Math.floor(diffInSeconds / 60)
          setLastSavedText(`${minutes} min${minutes > 1 ? 's' : ''} ago`)
        } else {
          setLastSavedText(new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }
      }
      updateLastSavedText()
      const interval = setInterval(updateLastSavedText, 60000)
      return () => clearInterval(interval)
    } else {
      setLastSavedText('Not saved')
    }
  }, [lastSaved])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isDropdownOpen])

  const handlePresetSelect = (preset) => {
    onZoomPreset(preset)
    setIsDropdownOpen(false)
  }

  const handleReset = () => {
    onZoomReset()
    setIsDropdownOpen(false)
  }

  const handleRename = () => {
    if (renameValue && renameValue !== fileNameWithoutExt) {
      if (filePath) {
        window.electron.ipcRenderer.send('rename-file', { oldPath: filePath, newName: renameValue })
      } else {
        editor.getEditorState().read(() => {
          const data = $getRoot().getTextContent()
          window.electron.ipcRenderer.send('save-file-as', { data, defaultName: renameValue })
        })
      }
    }
    setIsRenaming(false)
  }

  const handleDoubleClick = () => {
    setRenameValue(fileNameWithoutExt)
    setIsRenaming(true)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 px-4 py-1 bg-gray-100 border-t border-gray-200 text-sm text-gray-700">
      <div className="flex items-center gap-4">
        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="font-semibold bg-gray-200 rounded px-1 -my-0.5"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-1" onDoubleClick={handleDoubleClick} title="Double-click to rename">
            <span className="font-semibold cursor-pointer">{fileName}</span>
          </div>
        )}
        <div className="w-px h-4 bg-gray-300"></div>
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
        <div className="w-px h-4 bg-gray-300"></div>
        <span>{lastSavedText}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={onZoomOut}
            disabled={zoomLevel <= 25}
            className="p-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
            title="Zoom Out (Ctrl/Cmd + -)"
            aria-label="Zoom Out"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-2 min-w-[80px] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center justify-center"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
              title="Select zoom level"
            >
              <span>{zoomLevel}%</span>
              <svg className={`w-3 h-3 ml-1.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] max-h-60 overflow-y-auto z-50">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      preset === zoomLevel
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {preset}%
                    {preset === 100 && <span className="text-xs text-gray-400 ml-2">(Default)</span>}
                  </button>
                ))}
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Reset to 100%
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onZoomIn}
            disabled={zoomLevel >= 300}
            className="p-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
            title="Zoom In (Ctrl/Cmd + +)"
            aria-label="Zoom In"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-gray-50 transition-colors"
            title="Fit to Width (Ctrl/Cmd + 0)"
            aria-label="Reset zoom to 100%"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>
        <div className="w-px h-4 bg-gray-300"></div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          <span className="font-semibold">Ready</span>
        </div>
      </div>
    </div>
  )
}

export default Footer
