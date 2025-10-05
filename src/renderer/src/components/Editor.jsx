import { useEffect, useRef } from 'react'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import ListSmartBreakPlugin from './toolbar/ListSmartBreakPlugin'
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { $getRoot, $createParagraphNode } from 'lexical'

const styles = `
  .editor-underline {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-decoration-color: currentColor;
    text-underline-offset: 2px;
  }

  .editor-content {
    color: #1f2937; /* text-gray-800 */
  }
  .dark .editor-content {
    color: #d1d5db; /* text-gray-300 */
  }

  .editor-content a {
    color: #3b82f6; /* text-blue-500 */
  }
  .dark .editor-content a {
    color: #60a5fa; /* text-blue-400 */
  }

  .editor-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  .editor-content th, .editor-content td {
    border: 1px solid #d1d5db; /* border-gray-300 */
    padding: 8px;
    text-align: left;
  }
  .dark .editor-content th, .dark .editor-content td {
    border: 1px solid #4b5563; /* border-gray-600 */
  }

  .editor-content th {
    background-color: #f3f4f6; /* bg-gray-100 */
    font-weight: 600;
  }
  .dark .editor-content th {
    background-color: #374151; /* bg-gray-700 */
  }

  /* Print styles for A4 */
  @media print {
    .editor-content {
      font-size: 12pt;
      line-height: 1.5;
    }
  }
`

const ALL_TRANSFORMERS = TRANSFORMERS;

function MarkdownPlugin({ initialMarkdown }) {
  const [editor] = useLexicalComposerContext()
  const hasLoadedContent = useRef(false)

  useEffect(() => {
    if (editor && initialMarkdown && !hasLoadedContent.current) {
      hasLoadedContent.current = true
      queueMicrotask(() => {
        editor.update(
          () => {
            try {
              const root = $getRoot()
              root.clear()
              $convertFromMarkdownString(initialMarkdown, ALL_TRANSFORMERS)
              if (root.getChildrenSize() === 0) {
                root.append($createParagraphNode())
              }
            } catch (error) {
              console.error('Error converting markdown:', error)
              const root = $getRoot()
              root.clear()
              root.append($createParagraphNode())
            }
          },
          { discrete: true }
        )
      })
    } else if (editor && !initialMarkdown && !hasLoadedContent.current) {
      hasLoadedContent.current = true
      editor.update(() => {
        const root = $getRoot()
        if (root.getChildrenSize() === 0) {
          root.append($createParagraphNode())
        }
      })
    }
  }, [editor, initialMarkdown])

  return null
}

export default function Editor({ initialMarkdown, zoomLevel = 100 }) {
  const marginTop = '72px'
  const marginBottom = '72px'
  const marginLeft = '72px'
  const marginRight = '72px'
  const baseFontSize = 16
  const calculatedFontSize = `${baseFontSize}px`

  return (
    <div className="relative w-full">
      <style>{styles}</style>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="editor-content outline-none w-full min-h-[800px] focus:outline-none"
            style={{
              paddingTop: marginTop,
              paddingBottom: marginBottom,
              paddingLeft: marginLeft,
              paddingRight: marginRight,
              fontSize: calculatedFontSize,
              lineHeight: '1.6'
            }}
          />
        }
        placeholder={
          <div
            className="absolute select-none pointer-events-none text-gray-400 dark:text-gray-500"
            style={{
              top: marginTop,
              left: marginLeft,
              fontSize: calculatedFontSize
            }}
          >
            Start typing your document...
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ListPlugin />
      <TablePlugin />
      <LinkPlugin />
      <ListSmartBreakPlugin />
      <MarkdownShortcutPlugin transformers={ALL_TRANSFORMERS} />
      <MarkdownPlugin initialMarkdown={initialMarkdown} />
    </div>
  )
}
