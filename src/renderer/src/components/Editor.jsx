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
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { useTranslation } from 'react-i18next'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS
} from '@lexical/markdown'
import { $getRoot, $createParagraphNode } from 'lexical'

import ListSmartBreakPlugin from './toolbar/ListSmartBreakPlugin'

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

  @media print {
    .editor-content {
      font-size: 12pt;
      line-height: 1.5;
    }
  }
`

// Use the spread operator on the TRANSFORMERS object to get all transformers.
// This is the most reliable way to ensure all standard transformers are included.
const ALL_TRANSFORMERS = [
  ...Object.values(TRANSFORMERS)
];

function MarkdownPlugin({ initialContent, onContentChange }) {
  const [editor] = useLexicalComposerContext()
  const isInitialLoad = useRef(true)
  const hasSetInitialContent = useRef(false)

  useEffect(() => {
    if (editor && initialContent && !hasSetInitialContent.current) {
      const timer = setTimeout(() => {
        editor.update(
          () => {
            try {
              $convertFromMarkdownString(initialContent, ALL_TRANSFORMERS)
              hasSetInitialContent.current = true
            } catch (error) {
              console.error('Error converting Markdown:', error)
              const root = $getRoot()
              root.clear()
              const paragraph = $createParagraphNode()
              root.append(paragraph)
              hasSetInitialContent.current = true
            }
          },
          { discrete: true }
        )
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [editor, initialContent])

  const handleChange = (editorState, editor) => {
    if (isInitialLoad.current && initialContent) {
      isInitialLoad.current = false
      return
    }

    editor.update(() => {
      const markdown = $convertToMarkdownString(ALL_TRANSFORMERS)
      onContentChange(markdown)
    })
  }

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
}

MarkdownPlugin.propTypes = {
  initialContent: PropTypes.string,
  onContentChange: PropTypes.func.isRequired
}

export default function Editor({ initialContent, onContentChange, zoomLevel = 100 }) {
  const { t } = useTranslation()
  const marginTop = '72px'
  const marginBottom = '72px'
  const marginLeft = '72px'
  const marginRight = '72px'

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
      <LinkPlugin />
      <HorizontalRulePlugin />
      <ListSmartBreakPlugin />
      <MarkdownShortcutPlugin transformers={ALL_TRANSFORMERS} />
      <MarkdownPlugin initialContent={initialContent} onContentChange={onContentChange} />
    </motion.div>
  )
}

Editor.propTypes = {
  initialContent: PropTypes.string,
  onContentChange: PropTypes.func.isRequired,
  zoomLevel: PropTypes.number
}
