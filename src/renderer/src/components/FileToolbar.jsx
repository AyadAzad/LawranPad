import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown'

const ALL_TRANSFORMERS = [...TRANSFORMERS]

const FileToolbar = ({ filePath }) => {
  const [editor] = useLexicalComposerContext()

  const handleOpenFile = () => {
    window.electron.ipcRenderer.send('open-file')
  }

  const handleSaveFile = () => {
    editor.getEditorState().read(() => {
      try {
        // Convert editor content to markdown
        const markdown = $convertToMarkdownString(ALL_TRANSFORMERS)
        window.electron.ipcRenderer.send('save-file', { filePath, data: markdown })
      } catch (error) {
        console.error('Error saving file:', error)
      }
    })
  }

  const handleSaveFileAs = () => {
    editor.getEditorState().read(() => {
      try {
        // Convert editor content to markdown
        const markdown = $convertToMarkdownString(ALL_TRANSFORMERS)
        window.electron.ipcRenderer.send('save-file-as', markdown)
      } catch (error) {
        console.error('Error saving file:', error)
      }
    })
  }

  const handleExit = () => {
    window.electron.ipcRenderer.send('exit-app')
  }

  const buttonClasses =
    'flex items-center justify-center w-12 h-12 rounded-lg hover:bg-green-200 transition-colors duration-200'
  const svgIconClasses = 'w-6 h-6 text-gray-600'

  return (
    <aside className="w-20 bg-white/80 border-r border-gray-200 shadow-lg flex flex-col items-center p-4 gap-4">
      <div className="text-lg font-bold text-green-700 mb-4">File</div>
      <button onClick={handleOpenFile} className={buttonClasses} title="Open File">
        <svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z"
          ></path>
        </svg>
      </button>
      <button onClick={handleSaveFile} className={buttonClasses} title="Save File">
        <svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          ></path>
        </svg>
      </button>
      <button onClick={handleSaveFileAs} className={buttonClasses} title="Save As">
        <svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 14l9-5-9-5-9 5 9 5z"
          ></path>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 14l6.16-3.422A12.083 12.083 0 0121 12c0 6.627-5.373 12-12 12S-3 18.627-3 12a12.083 12.083 0 012.84-6.422L12 14z"
          ></path>
        </svg>
      </button>
      <button onClick={handleExit} className={buttonClasses} title="Exit">
        <svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 16l4-4m0 0l-4-4m4 4H3"
          ></path>
        </svg>
      </button>
    </aside>
  )
}

export default FileToolbar
