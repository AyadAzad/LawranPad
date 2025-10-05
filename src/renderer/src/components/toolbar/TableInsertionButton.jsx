import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_TABLE_COMMAND } from '@lexical/table'

const TableInsertionButton = () => {
  const [editor] = useLexicalComposerContext()

  const handleClick = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: 3, columns: 3 })
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200"
      title="Insert Table"
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
          d="M4 4h16v16H4V4zm2 2v5h5V6H6zm7 0v5h5V6h-5zm-7 7v5h5v-5H6zm7 0v5h5v-5h-5z"
        />
      </svg>
    </button>
  )
}

export default TableInsertionButton
