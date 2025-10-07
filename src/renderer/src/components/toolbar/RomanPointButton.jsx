import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode
} from '@lexical/list'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $findMatchingParent } from '@lexical/utils'
import { useState, useEffect, useCallback } from 'react'

const RomanPointButton = () => {
  const [editor] = useLexicalComposerContext()
  const [isActive, setIsActive] = useState(false)

  const updateState = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const listNode = $findMatchingParent(selection.anchor.getNode(), (node) => $isListNode(node))
        if (listNode && listNode.getListType() === 'number') {
          const style = listNode.getStyle()
          setIsActive(style ? style.includes('upper-roman') : false)
        } else {
          setIsActive(false)
        }
      }
    })
  }, [editor])

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      updateState()
    })
  }, [editor, updateState])

  const handleClick = () => {
    if (isActive) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const listNode = $findMatchingParent(selection.anchor.getNode(), $isListNode)
          if (listNode) {
            listNode.setStyle('list-style-type: upper-roman;')
          }
        }
      })
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded transition-colors text-gray-800 dark:text-gray-200 ${
        isActive
          ? 'bg-gray-200 dark:bg-gray-700'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
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
