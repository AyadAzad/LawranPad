import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'

const BulletPointButton = () => {
  const [editor] = useLexicalComposerContext()

  const handleClick = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200"
      title="Bullet Points"
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
          d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"
        />
      </svg>
    </button>
  )
}

export default BulletPointButton
