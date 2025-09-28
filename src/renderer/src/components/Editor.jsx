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
import FileToolbar from './FileToolbar'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'

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
    paragraph: 'mb-2',
    paragraphLeft: 'text-left',
    paragraphCenter: 'text-center',
    paragraphRight: 'text-right',
    paragraphJustify: 'text-justify',
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
  ]
}

const styles = `
  .editor-underline {
    text-decoration: underline;
    text-decoration-thickness: var(--underline-thickness, 2px);
    text-decoration-color: var(--underline-color, currentColor);
    text-underline-offset: 2px;
  }
`

export default function Editor({ initialContent, filePath }) {
  return (
    <div className="flex flex-1 items-center justify-center min-h-0 h-full w-full">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editorState: initialContent
            ? () => {
                const root = $getRoot()
                const paragraph = $createParagraphNode()
                paragraph.append($createTextNode(initialContent))
                root.append(paragraph)
              }
            : null
        }}
      >
        <div className="flex flex-row flex-1 max-w-5xl w-full min-h-[70vh] h-[70vh] bg-white/90 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <FileToolbar filePath={filePath} />
          <div className="flex flex-col flex-1">
            <style>{styles}</style>
            <Toolbar />
            <div className="flex-1 relative flex flex-col">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="outline-none w-full h-full min-h-[40vh] bg-white rounded-b-xl px-6 py-5 text-lg text-gray-800 focus:ring-2 focus:ring-blue-300 transition shadow-inner" />
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
              <OnChangePlugin onChange={(editorState) => editorState.read(() => {})} />
            </div>
          </div>
        </div>
      </LexicalComposer>
    </div>
  )
}
