import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'
import { $getSelection, $isRangeSelection, KEY_DOWN_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical'
import { $isListItemNode } from '@lexical/list'

function ListSmartBreakPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const onKeyDown = (event) => {
      const { key } = event
      if (key === 'Enter') {
        const selection = $getSelection()
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const anchor = selection.anchor
          const anchorNode = anchor.getNode()

          const listItem = $findMatchingParent(anchorNode, $isListItemNode)

          if (listItem && listItem.getTextContent().length === 0) {
            // Dispatch outdent command to break out of the list
            editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
            event.preventDefault() // Prevent default Enter behavior
            return true // Indicate command was handled
          }
        }
      }
      return false // Command not handled
    }

    // Register the keydown listener with a medium priority
    return editor.registerCommand(KEY_DOWN_COMMAND, onKeyDown, 2)
  }, [editor])

  return null
}

// Helper to find parent node of a specific type
function $findMatchingParent(startingNode, predicate) {
  let node = startingNode
  while (node !== null) {
    if (predicate(node)) {
      return node
    }
    node = node.getParent()
  }
  return null
}

export default ListSmartBreakPlugin
