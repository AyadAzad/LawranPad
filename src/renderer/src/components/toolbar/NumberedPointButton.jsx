import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode
} from '@lexical/list'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $findMatchingParent } from '@lexical/utils'
import { useState, useEffect, useCallback } from 'react'

const NumberedPointButton = () => {
  const [editor] = useLexicalComposerContext()
  const [isActive, setIsActive] = useState(false)

  const updateState = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const listNode = $findMatchingParent(selection.anchor.getNode(), (node) => $isListNode(node))
        if (listNode && listNode.getListType() === 'number') {
          const style = listNode.getStyle()
          setIsActive(!style || !style.includes('upper-roman'))
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
            listNode.setStyle('list-style-type: decimal;')
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
      title="Numbered Points"
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
          d="M8 4h13v2H8V4zM2.998 13v-1h2v1h-1v1h1v1h-1v1h1v1h-2v-1h1v-1h-1v-1h-1v-1h1zM8 11h13v2H8v-2zm0 7h13v2H8v-2zM4.873 3.75a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0zM3.5 9V4.5h2V9h-1V5.5h-1V9h-1z"
        />
      </svg>
    </button>
  )
}

export default NumberedPointButton
