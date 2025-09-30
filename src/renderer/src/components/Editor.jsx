import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { TextFormatPlugin } from './toolbar/TextFormatPlugin'

const styles = `
  .editor-underline {
    text-decoration: underline;
    text-decoration-thickness: var(--underline-thickness, 2px);
    text-decoration-color: var(--underline-color, currentColor);
    text-underline-offset: 2px;
  }
`

export default function Editor() {
  return (
    <div className="flex-1 relative flex flex-col">
      <style>{styles}</style>
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="outline-none w-full h-full min-h-[40vh] bg-white rounded-b-xl px-6 py-5 text-lg text-gray-800 focus:ring-2 focus:ring-blue-300 transition shadow-inner" />
        }
        placeholder={
          <div className="absolute left-6 top-5 text-gray-400 select-none pointer-events-none text-lg">
            Type something beautiful...
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <TextFormatPlugin />
      <OnChangePlugin onChange={(editorState) => editorState.read(() => {})} />
    </div>
  )
}
