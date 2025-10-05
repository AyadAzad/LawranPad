import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot } from 'lexical'

const OutputToolbar = () => {
  const [editor] = useLexicalComposerContext()

  const handleExportToPDF = () => {
    editor.getEditorState().read(() => {
      const data = $getRoot().getTextContent()
      window.electron.ipcRenderer.send('export-to-pdf', data)
    })
  }

  const handleExportToDocx = () => {
    editor.getEditorState().read(() => {
      const data = $getRoot().getTextContent()
      window.electron.ipcRenderer.send('export-to-docx', data)
    })
  }

  const buttonClasses =
    'flex items-center justify-center w-12 h-12 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors duration-200'
  const svgIconClasses = 'w-6 h-6 text-gray-600 dark:text-gray-300'

  return (
    <aside className="w-20 bg-white/80 dark:bg-gray-800/80 border-l border-gray-200 dark:border-gray-700 shadow-lg flex flex-col items-center p-4 gap-4">
      <div className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-4">Output</div>
      <button onClick={handleExportToPDF} className={buttonClasses} title="Export as PDF">
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      </button>
      <button onClick={handleExportToDocx} className={buttonClasses} title="Export as DOCX">
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      </button>
    </aside>
  )
}

export default OutputToolbar
