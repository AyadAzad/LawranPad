import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createCodeNode } from '@lexical/code'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $setBlocksType } from '@lexical/selection'

export default function CodeBlockButton() {
  const [editor] = useLexicalComposerContext()

  const handleClick = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode())
      }
    })
  }

  return (
    <button onClick={handleClick} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Insert Code Block">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
      </svg>
    </button>
  )
}
