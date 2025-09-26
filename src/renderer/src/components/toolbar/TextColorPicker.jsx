import { useState, useCallback, useRef, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'

// Define color palette
const COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#808080', // Gray
  '#800000', // Maroon
  '#808000', // Olive
  '#008000', // Dark Green
  '#800080', // Purple
  '#008080', // Teal
  '#000080', // Navy
  '#FFA500', // Orange
  '#A52A2A', // Brown
  '#FFC0CB', // Pink
  '#E6E6FA', // Lavender
  '#98FB98' // Pale Green
]

const TextColorPicker = () => {
  const [editor] = useLexicalComposerContext()
  const [isOpen, setIsOpen] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const popoverRef = useRef(null)
  const buttonRef = useRef(null)

  const handleClickOutside = useCallback((event) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target) &&
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
              node.setStyle(`color: ${color}`)
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
        className="p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-2"
        title="Text Color"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            fill="currentColor"
            d="M15.246 14H8.754l-1.6 4H5l6-15h2l6 15h-2.154l-1.6-4zm-.8-2L12 5.885 9.554 12h4.892z"
          />
        </svg>
        <div
          className="w-4 h-4 rounded border border-gray-300"
          style={{ backgroundColor: currentColor }}
        />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border border-gray-100 z-50"
          style={{
            width: '232px',
            animation: 'slideIn 0.2s ease-out',
            transformOrigin: 'top'
          }}
        >
          <div className="grid grid-cols-10 gap-1">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-5 h-5 rounded transition-transform hover:scale-110 focus:outline-none ${
                  currentColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="mt-2 w-full h-8 cursor-pointer"
          />
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
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`
document.head.appendChild(style)

export default TextColorPicker
