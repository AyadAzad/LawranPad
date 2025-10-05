import ThemeToggleButton from './toolbar/ThemeToggleButton'

const FileToolbar = ({ onSave, onOpen }) => {
  const handleExit = () => {
    window.electron.ipcRenderer.send('exit-app')
  }

  const buttonClasses =
    'flex items-center justify-center w-12 h-12 rounded-lg hover:bg-green-200 dark:hover:bg-green-700 transition-colors duration-200'
  const svgIconClasses = 'w-6 h-6 text-gray-600 dark:text-gray-300'

  return (
    <aside className="w-20 bg-white/80 dark:bg-gray-800/80 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col items-center p-4 gap-4">
      <div className="text-lg font-bold text-green-700 dark:text-green-400 mb-4">File</div>
      <button onClick={onOpen} className={buttonClasses} title="Open File">
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
      <button onClick={onSave} className={buttonClasses} title="Save File">
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

      <div className="flex-grow"></div>
      <ThemeToggleButton />
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
