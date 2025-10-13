import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import ListSmartBreakPlugin from './toolbar/ListSmartBreakPlugin'
import { $generateNodesFromDOM } from '@lexical/html'
import {
  HEADING,
  QUOTE,
  CODE,
  LINK,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  CHECK_LIST,
  INLINE_CODE,
  UNORDERED_LIST,
  ORDERED_LIST
} from '@lexical/markdown'
import { $getRoot, $createParagraphNode } from 'lexical'

const styles = `
  .editor-underline {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-decoration-color: currentColor;
    text-underline-offset: 2px;
  }

  .editor-content {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    color: #1f2937;
  }

  .editor-content h1, .editor-content h2, .editor-content h3,
  .editor-content h4, .editor-content h5, .editor-content h6 {
    font-weight: 600;
    color: #111827;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  .editor-content h1 {
    font-size: 2em;
    margin-top: 0;
  }

  .editor-content h2 {
    font-size: 1.5em;
  }

  .editor-content h3 {
    font-size: 1.25em;
  }

  .editor-content p {
    margin-bottom: 1rem;
  }

  .editor-content p:last-child {
    margin-bottom: 0;
  }

  .editor-content ul, .editor-content ol {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }

  .editor-content li {
    margin-bottom: 0.25rem;
  }

  .editor-content code {
    background-color: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.875em;
  }

  .editor-content pre {
    background-color: #f3f4f6;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  .editor-content pre code {
    background-color: transparent;
    padding: 0;
  }

  .editor-content blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #4b5563;
    font-style: italic;
  }

  .editor-content a {
    color: #3b82f6;
    text-decoration: underline;
  }

  .editor-content a:hover {
    color: #2563eb;
  }

  .editor-content strong {
    font-weight: 600;
  }

  .editor-content em {
    font-style: italic;
  }

  .editor-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  .editor-content th, .editor-content td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }

  .editor-content th {
    background-color: #f3f4f6;
    font-weight: 600;
  }

  /* Print styles for A4 */
  @media print {
    .editor-content {
      font-size: 12pt;
      line-height: 1.5;
    }
  }
`

const ALL_TRANSFORMERS = [
  HEADING,
  QUOTE,
  CODE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CHECK_LIST,
  INLINE_CODE,
  LINK,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH
]

function HtmlPlugin({ initialHtml, onHtmlChange }) {
  const [editor] = useLexicalComposerContext()
  const isInitialLoad = useRef(true)
  const hasLoadedContent = useRef(false)
  const initialHtmlRef = useRef(initialHtml)

  // Load initial HTML content
  useEffect(() => {
    if (!editor) {
      return
    }

    if (initialHtml && !hasLoadedContent.current) {
      hasLoadedContent.current = true
      initialHtmlRef.current = initialHtml

      queueMicrotask(() => {
        editor.update(
          () => {
            try {
              const parser = new DOMParser()
              const dom = parser.parseFromString(initialHtml, 'text/html')
              const nodes = $generateNodesFromDOM(editor, dom)
              const root = $getRoot()
              root.clear()
              root.append(...nodes)
            } catch (error) {
              console.error('Error converting HTML:', error)
              const root = $getRoot()
              root.clear()
              const paragraph = $createParagraphNode()
              root.append(paragraph)
            }
          },
          {
            discrete: true
          }
        )

        setTimeout(() => {
          isInitialLoad.current = false
        }, 100)
      })
    } else if (!initialHtml && !hasLoadedContent.current) {
      hasLoadedContent.current = true

      editor.update(() => {
        const root = $getRoot()
        if (root.getChildrenSize() === 0) {
          const paragraph = $createParagraphNode()
          root.append(paragraph)
        }
      })

      setTimeout(() => {
        isInitialLoad.current = false
      }, 100)
    }
  }, [editor, initialHtml])

  useEffect(() => {
    hasLoadedContent.current = false
  }, [initialHtml])

  const handleChange = () => {
    if (isInitialLoad.current) {
      return
    }
    // Use a timeout to ensure the DOM is updated before we read it.
    setTimeout(() => {
      const rootElement = editor.getRootElement()
      if (rootElement) {
        const htmlString = rootElement.innerHTML
        if (htmlString !== initialHtmlRef.current) {
          initialHtmlRef.current = htmlString
          onHtmlChange(htmlString)
        }
      }
    }, 0)
  }

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
}

HtmlPlugin.propTypes = {
  initialHtml: PropTypes.string,
  onHtmlChange: PropTypes.func.isRequired
}

export default function Editor({ initialHtml, onHtmlChange, zoomLevel = 100 }) {
  const marginTop = '72px' // 1 inch
  const marginBottom = '72px' // 1 inch
  const marginLeft = '72px' // 1 inch
  const marginRight = '72px' // 1 inch

  const baseFontSize = 16
  const calculatedFontSize = `${(baseFontSize * zoomLevel) / 100}px`

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
            className="absolute select-none pointer-events-none text-gray-400"
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
      <HtmlPlugin initialHtml={initialHtml} onHtmlChange={onHtmlChange} />
    </div>
  )
}

Editor.propTypes = {
  initialHtml: PropTypes.string,
  onHtmlChange: PropTypes.func.isRequired,
  zoomLevel: PropTypes.number
}
