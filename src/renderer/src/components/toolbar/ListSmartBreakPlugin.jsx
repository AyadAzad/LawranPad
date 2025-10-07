import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'
import {
  $getSelection,
  $isRangeSelection,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_HIGH,
  $createParagraphNode
} from 'lexical'
import { $isListItemNode, $isListNode } from '@lexical/list'
import { $setBlocksType } from '@lexical/selection'
import { $findMatchingParent } from '@lexical/utils'

function ListSmartBreakPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const command = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (event.key === 'Enter') {
          return editor.update(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
              return false
            }

            const anchorNode = selection.anchor.getNode()
            const listItem = $findMatchingParent(anchorNode, $isListItemNode)

            // If the list item is empty, break out of the list
            if (listItem && listItem.getTextContent().trim() === '') {
              // Check if the list item is the only child of its parent list
              const parentList = $findMatchingParent(listItem, $isListNode)
              if (parentList && parentList.getChildrenSize() === 1) {
                // If it's the only item, remove the entire list
                parentList.remove()
                return true
              }

              // Otherwise, just convert the block to a paragraph
              $setBlocksType(selection, () => $createParagraphNode())
              return true
            }

            return false
          })
        }
        return false
      },
      COMMAND_PRIORITY_HIGH
    )

    return () => {
      command()
    }
  }, [editor])

  return null
}

export default ListSmartBreakPlugin
