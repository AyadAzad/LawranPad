import { useState, useEffect } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import Editor from './components/Editor'
import Toolbar from './components/Toolbar'
import FileToolbar from './components/FileToolbar'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'

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

export default function App() {
  const [filePath, setFilePath] = useState(null)
  const [initialContent, setInitialContent] = useState('')
  const [key, setKey] = useState(Date.now())

  useEffect(() => {
    const handleFileOpened = (event, { filePath, data }) => {
      setFilePath(filePath)
      setInitialContent(data)
      setKey(Date.now()) // Remounts the editor with new content
    }

    const handleFileSaved = (event, newFilePath) => {
      setFilePath(newFilePath)
    }

    window.electron.ipcRenderer.on('file-opened', handleFileOpened)
    window.electron.ipcRenderer.on('file-saved', handleFileSaved)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('file-opened')
      window.electron.ipcRenderer.removeAllListeners('file-saved')
    }
  }, [])

  const initialConfig = {
    ...editorConfig,
    editorState: initialContent
      ? () => {
          const root = $getRoot()
          const paragraph = $createParagraphNode()
          paragraph.append($createTextNode(initialContent))
          root.append(paragraph)
        }
      : null
  }

  return (
    <LexicalComposer key={key} initialConfig={initialConfig}>
      <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex">
        <FileToolbar filePath={filePath} />
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Toolbar />
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <Editor />
          </div>
        </main>
      </div>
    </LexicalComposer>
  )
}
