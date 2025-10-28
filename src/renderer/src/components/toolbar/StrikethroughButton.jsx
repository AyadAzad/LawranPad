import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { FORMAT_TEXT_COMMAND } from 'lexical'

const StrikethroughButton = () => {
  const [editor] = useLexicalComposerContext()

  const handleClick = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white"
      title="Strikethrough"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        className="w-5 h-5"
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M14.222 12.65a1 1 0 0 1 1.415 1.413l-4.243 4.243a1 1 0 0 1-1.414 0l-2.122-2.121a1 1 0 0 1 1.415-1.414l1.414 1.414 3.536-3.536zM12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"
        />
      </svg>
    </button>
  )
}

export default StrikethroughButton
