import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND
} from 'lexical'

export function TextFormatPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      FORMAT_TEXT_COMMAND,
      (format, value) => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          if (typeof format === 'string') {
            if (format === 'fontFamily') {
              selection.getNodes().forEach((node) => {
                if (node.setStyle) {
                  node.setStyle(`font-family: ${value}`)
                }
              })
            } else {
              selection.formatText(format)
            }
          } else {
            selection.formatText(format)
          }
        }
        return true
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          // Selection change handling
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  return null
}
