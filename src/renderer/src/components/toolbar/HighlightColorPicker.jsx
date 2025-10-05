import { useState, useCallback, useRef, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'

const HIGHLIGHT_COLORS = [
  { color: 'transparent', label: 'Default' },
  { color: '#ffeb3b', label: 'Yellow' },
  { color: '#ffc107', label: 'Orange' },
  { color: '#ff9800', label: 'Dark Orange' },
  { color: '#f44336', label: 'Red' },
  { color: '#e91e63', label: 'Pink' },
  { color: '#9c27b0', label: 'Purple' },
  { color: '#673ab7', label: 'Deep Purple' },
  { color: '#3f51b5', label: 'Indigo' },
  { color: '#2196f3', label: 'Blue' },
  { color: '#03a9f4', label: 'Light Blue' },
  { color: '#00bcd4', label: 'Cyan' },
  { color: '#009688', label: 'Teal' },
  { color: '#4caf50', label: 'Green' },
  { color: '#8bc34a', label: 'Light Green' },
  { color: '#cddc39', label: 'Lime' }
]

const HighlightColorPicker = () => {
  const [editor] = useLexicalComposerContext()
  const [isOpen, setIsOpen] = useState(false)
  const [currentColor, setCurrentColor] = useState('transparent')
  const popoverRef = useRef(null)
  const buttonRef = useRef(null)

  const handleClickOutside = useCallback((event) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target)
    ) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  const handleColorChange = useCallback(
    (color) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          selection.getNodes().forEach((node) => {
            if (node.getType() === 'text') {
              node.setStyle(`background-color: ${color}`)
            }
          })
        }
      })
      setCurrentColor(color)
      setIsOpen(false)
    },
    [editor]
  )

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-800 dark:text-gray-200"
        title="Highlight Color"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            fill="currentColor"
            d="M14.688 3.375l5.937 5.938-9.375 9.374-5.937-5.937 9.375-9.375zm-11.25 11.25l5.937 5.938-3.562 1.125-3.5-3.5 1.125-3.563z"
          />
        </svg>
        <div
          className="w-4 h-4 rounded border border-gray-300 dark:border-gray-500"
          style={{ backgroundColor: currentColor }}
        />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-50"
          style={{
            width: '200px',
            animation: 'slideIn 0.2s ease-out',
            transformOrigin: 'top'
          }}
        >
          <div className="grid grid-cols-4 gap-1">
            {HIGHLIGHT_COLORS.map(({ color, label }) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-10 h-10 rounded transition-all hover:scale-105 focus:outline-none ${
                  currentColor === color ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : ''
                } ${color === 'transparent' ? 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600' : ''}`}
                style={{ backgroundColor: color }}
                title={label}
              >
                {color === 'transparent' && (
                  <svg className="w-6 h-6 text-red-500 mx-auto" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HighlightColorPicker
