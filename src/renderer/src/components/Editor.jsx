import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { TextFormatPlugin } from './toolbar/TextFormatPlugin'
import Toolbar from './Toolbar'

const editorConfig = {
  namespace: 'MyEditor',
  onError: (error) => console.error(error),
  theme: {
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'line-through',
      underlineStrikethrough: 'underline line-through',
      fontFamily: 'font-family'
    },
    // Add alignment classes
    paragraph: 'mb-2',
    paragraphLeft: 'text-left',
    paragraphCenter: 'text-center',
    paragraphRight: 'text-right',
    paragraphJustify: 'text-justify',
    // Add font size classes
    fontSize: {
      '12px': 'text-xs',
      '14px': 'text-sm',
      '16px': 'text-base',
      '18px': 'text-lg',
      '20px': 'text-xl',
      '24px': 'text-2xl',
      '30px': 'text-3xl',
      '36px': 'text-4xl'
    }
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    ListItemNode,
    ListNode,
    TableCellNode,
    TableNode,
    TableRowNode,
    CodeHighlightNode,
    CodeNode,
    AutoLinkNode,
    LinkNode
  ],
  editorState: null
}

// Custom styles that will be applied globally to the editor
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
    <div className="flex flex-1 items-center justify-center min-h-0 h-full w-full bg-gradient-to-br from-green-100 via-white to-blue-100 p-0">
      <div className="flex flex-col flex-1 max-w-4xl min-h-[60vh] h-[70vh] bg-white/90 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <LexicalComposer
          initialConfig={{
            ...editorConfig,
            onError: (error) => console.error(error),
            nodes: [...(editorConfig.nodes || [])]
          }}
        >
          <div className="editor-shell">
            <style>{styles}</style>
            <Toolbar />
            <div className="flex-1 relative flex flex-col">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="outline-none w-full h-full min-h-[40vh] bg-white rounded-xl px-6 py-5 text-lg text-gray-800 focus:ring-2 focus:ring-blue-300 transition shadow-inner" />
                }
                placeholder={
                  <div className="absolute left-8 top-8 text-gray-400 select-none pointer-events-none text-lg">
                    Type something beautiful...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <TextFormatPlugin />
              <OnChangePlugin
                onChange={(editorState) => {
                  editorState.read(() => {
                    // Read the editor state if needed
                  })
                }}
              />
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>
  )
}
