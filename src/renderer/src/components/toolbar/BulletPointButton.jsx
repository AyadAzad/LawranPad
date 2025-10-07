import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode
} from '@lexical/list'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $findMatchingParent } from '@lexical/utils'
import { useState, useEffect, useCallback } from 'react'

const BulletPointButton = () => {
  const [editor] = useLexicalComposerContext()
  const [isActive, setIsActive] = useState(false)

  const updateState = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const listNode = $findMatchingParent(selection.anchor.getNode(), (node) => $isListNode(node))
        setIsActive(listNode ? listNode.getListType() === 'bullet' : false)
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
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
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
