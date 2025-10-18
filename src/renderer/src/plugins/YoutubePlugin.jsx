import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $getRoot,
  $createParagraphNode,
  COMMAND_PRIORITY_LOW,
  createCommand
} from 'lexical'
import { useEffect } from 'react'
import { $createYouTubeNode } from '../nodes/YouTubeNode'

export const INSERT_YOUTUBE_COMMAND = createCommand('INSERT_YOUTUBE_COMMAND')

export function YouTubePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // Check if YouTubeNode is registered on editor
    const isYouTubeNodeRegistered = editor._nodes.has('youtube')
    if (!isYouTubeNodeRegistered) {
      console.error('YouTubePlugin: YouTubeNode not registered on editor')
      return
    }

    return editor.registerCommand(
      INSERT_YOUTUBE_COMMAND,
      (payload) => {
        const { videoId } = payload
        const selection = $getSelection()

        editor.update(() => {
          const youTubeNode = $createYouTubeNode(videoId)

          if (selection) {
            const focus = selection.focus.getNode()
            focus.getTopLevelElementOrThrow().insertAfter(youTubeNode)
          } else {
            $getRoot().append(youTubeNode)
          }

          // Create a new paragraph after the video
          const paragraph = $createParagraphNode()
          youTubeNode.insertAfter(paragraph)
          paragraph.select()
        })

        return true
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  return null
}
