import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $getRoot,
  $createParagraphNode,
  COMMAND_PRIORITY_LOW,
  createCommand
} from 'lexical'
import { useEffect } from 'react'
import { $createImageNode } from '../nodes/ImageNode'

export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND')

export function ImagePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // Check if ImageNode is registered on editor
    const isImageNodeRegistered = editor._nodes.has('image')
    if (!isImageNodeRegistered) {
      console.error('ImagePlugin: ImageNode not registered on editor')
      return
    }

    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const { src, altText, width, height } = payload
        const selection = $getSelection()

        editor.update(() => {
          const imageNode = $createImageNode(src, altText, width, height)

          if (selection) {
            const focus = selection.focus.getNode()
            focus.getTopLevelElementOrThrow().insertAfter(imageNode)
          } else {
            $getRoot().append(imageNode)
          }

          // Create a new paragraph after the image
          const paragraph = $createParagraphNode()
          imageNode.insertAfter(paragraph)
          paragraph.select()
        })

        return true
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  return null
}
