import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { TRANSFORMERS } from '@lexical/markdown'
import { TextFormatPlugin } from './toolbar/TextFormatPlugin'

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
  }

  .editor-content p {
    margin-bottom: 1rem;
  }

  .editor-content p:last-child {
    margin-bottom: 0;
  }

  /* Print styles for A4 */
  @media print {
    .editor-content {
      font-size: 12pt;
      line-height: 1.5;
    }
  }
`

export default function Editor({ zoomLevel = 100 }) {
  // Professional document margins (similar to Word defaults)
  const marginTop = '72px'    // 1 inch
  const marginBottom = '72px' // 1 inch
  const marginLeft = '72px'   // 1 inch
  const marginRight = '72px'  // 1 inch

  // Base font size for professional documents
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
      <TextFormatPlugin />
      <ListPlugin />
      <LinkPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <OnChangePlugin onChange={(editorState) => editorState.read(() => {})} />
    </div>
  )
}
