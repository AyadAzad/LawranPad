import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { $getSelection, $isRangeSelection } from 'lexical'

export default function HorizontalRuleButton() {
  const [editor] = useLexicalComposerContext()

  const handleClick = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.insertNodes([$createHorizontalRuleNode()])
      }
    })
  }

  return (
    <button onClick={handleClick} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Insert Horizontal Rule">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16"></path>
      </svg>
    </button>
  )
}
