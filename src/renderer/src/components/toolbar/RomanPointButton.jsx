import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'

const RomanPointButton = () => {
  const [editor] = useLexicalComposerContext()

  const handleClick = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, 'roman')
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded hover:bg-gray-100 transition-colors"
      title="Roman Points"
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
          d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-1 4h2v2h-2V8zm0 4h2v6h-2v-6z"
        />
      </svg>
    </button>
  )
}

export default RomanPointButton
