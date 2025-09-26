import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'
import { useCallback, useState, useEffect } from 'react'

const LINE_SPACING_OPTIONS = [
  { value: '1', label: 'Single', displayValue: '1.0' },
  { value: '1.15', label: 'Relaxed', displayValue: '1.15' },
  { value: '1.5', label: 'One & Half', displayValue: '1.5' },
  { value: '2', label: 'Double', displayValue: '2.0' },
  { value: '2.5', label: 'Extra', displayValue: '2.5' },
  { value: '3', label: 'Triple', displayValue: '3.0' }
]

const LineSpacingDropdown = () => {
  const [editor] = useLexicalComposerContext()
  const [currentSpacing, setCurrentSpacing] = useState('1')
  const [isOpen, setIsOpen] = useState(false)

  // Track the current line spacing of selected text
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode()
          const style = node.getStyle()
          if (style) {
            const match = style.match(/line-height:\s*([\d.]+)/)
            if (match) {
              setCurrentSpacing(match[1])
            }
          }
        }
      })
    })
  }, [editor])

  const handleSpacingChange = useCallback(
    (spacing) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes()
          nodes.forEach((node) => {
            if (node.getType() === 'text' || node.getType() === 'paragraph') {
              node.setStyle(`line-height: ${spacing}`)
            }
          })
        }
      })
      setIsOpen(false)
    },
    [editor]
  )

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-32 h-10 px-3 rounded-lg border-2 transition-all duration-200
          flex items-center justify-between gap-2
          ${isOpen ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500'}
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50
        `}
      >
        <span className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 6h22M1 12h22M1 18h22" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {LINE_SPACING_OPTIONS.find((opt) => opt.value === currentSpacing)?.displayValue ||
              '1.0'}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
          style={{
            animation: 'slideIn 0.2s ease-out',
            transformOrigin: 'top'
          }}
        >
          {LINE_SPACING_OPTIONS.map(({ value, label, displayValue }) => (
            <button
              key={value}
              onClick={() => handleSpacingChange(value)}
              className={`
                w-full px-3 py-2 text-sm flex items-center justify-between gap-2
                transition-all duration-200 hover:bg-blue-50
                ${currentSpacing === value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
              `}
            >
              <span className="font-medium">{label}</span>
              <span className="text-xs text-gray-500">{displayValue}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Add keyframe animation
const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
document.head.appendChild(style)

export default LineSpacingDropdown
