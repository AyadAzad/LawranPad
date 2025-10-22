import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
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
import { useTranslation } from 'react-i18next'

import { YouTubePlugin } from '../plugins/YouTubePlugin'
import { ImagePlugin } from '../plugins/ImagePlugin'
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

// Import and register YouTubeNode
import { YoutubeNode } from '../nodes/YouTubeNode'

// Add this function to register custom nodes
export function registerCustomNodes(editor) {
  // Register YouTubeNode
  editor._nodes.forEach((node) => {
    if (node.name === 'youtube') {
      console.log('YouTubeNode already registered')
      return
    }
  })

  // Register the node if not already registered
  if (!editor._nodes.has('youtube')) {
    editor._nodes.set('youtube', YoutubeNode)
  }
}

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
    transition: box-shadow 0.3s ease-in-out;
  }

  .dark .editor-content {
    color: #d1d5db;
  }

  .editor-content:focus {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }

  .editor-content h1, .editor-content h2, .editor-content h3,
  .editor-content h4, .editor-content h5, .editor-content h6 {
    font-weight: 600;
    color: #111827;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  .dark .editor-content h1, .dark .editor-content h2, .dark .editor-content h3,
  .dark .editor-content h4, .dark .editor-content h5, .dark .editor-content h6 {
    color: #f9fafb;
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

  .dark .editor-content code {
    background-color: #374151;
    color: #e5e7eb;
  }

  .editor-content pre {
    background-color: #f3f4f6;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  .dark .editor-content pre {
    background-color: #1f2937;
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

  .dark .editor-content blockquote {
    border-left-color: #2563eb;
    background-color: rgba(30, 64, 175, 0.1);
    color: #9ca3af;
  }

  .editor-content a {
    color: #3b82f6;
    text-decoration: underline;
  }

  .dark .editor-content a {
    color: #60a5fa;
  }

  .editor-content a:hover {
    color: #2563eb;
  }

  .dark .editor-content a:hover {
    color: #93c5fd;
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
    border: 1px solid #d1d5db;
    padding: 8px;
    text-align: left;
  }

  .dark .editor-content th, .dark .editor-content td {
    border-color: #4b5563;
  }

  .editor-content th {
    background-color: #f3f4f6;
    font-weight: 600;
  }

  .dark .editor-content th {
    background-color: #374151;
    color: #f9fafb;
  }

  /* Image and Video styles */
  .editor-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
  }

  .editor-content .video-embed {
    margin: 1rem 0;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  .editor-content .video-embed iframe {
    width: 100%;
    height: 400px;
    border: none;
    display: block;
  }

  /* Responsive video */
  .editor-content .video-embed.responsive {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
  }

  .editor-content .video-embed.responsive iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* Print styles for A4 */
  @media print {
    .editor-content {
      font-size: 12pt;
      line-height: 1.5;
    }

    .editor-content img {
      max-width: 100% !important;
      page-break-inside: avoid;
    }

    .video-embed {
      display: none; /* Hide videos in print */
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

// Add this component to handle node registration
function NodeRegistrationPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    registerCustomNodes(editor)
  }, [editor])

  return null
}

export default function Editor({ initialHtml, onHtmlChange, zoomLevel = 100 }) {
  const { t } = useTranslation()
  const marginTop = '72px' // 1 inch
  const marginBottom = '72px' // 1 inch
  const marginLeft = '72px' // 1 inch
  const marginRight = '72px' // 1 inch

  const baseFontSize = 16
  const calculatedFontSize = `${(baseFontSize * zoomLevel) / 100}px`

  const editorVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const placeholderVariants = {
    initial: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }
  }

  return (
    <motion.div
      className="relative w-full"
      initial="hidden"
      animate="visible"
      variants={editorVariants}
    >
      <style>{styles}</style>
      <NodeRegistrationPlugin />
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="editor-content outline-none w-full min-h-[800px] focus:outline-none p-16 rounded-lg"
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
          <motion.div
            className="absolute select-none pointer-events-none text-gray-400 dark:text-gray-500"
            style={{
              top: marginTop,
              left: marginLeft,
              fontSize: calculatedFontSize
            }}
            variants={placeholderVariants}
            initial="initial"
            animate="animate"
          >
            {t('startTyping')}
          </motion.div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ListPlugin />
      <TablePlugin />
      <LinkPlugin />
      <ImagePlugin />
      <YouTubePlugin />
      <ListSmartBreakPlugin />
      <MarkdownShortcutPlugin transformers={ALL_TRANSFORMERS} />
      <HtmlPlugin initialHtml={initialHtml} onHtmlChange={onHtmlChange} />
    </motion.div>
  )
}

Editor.propTypes = {
  initialHtml: PropTypes.string,
  onHtmlChange: PropTypes.func.isRequired,
  zoomLevel: PropTypes.number
}
