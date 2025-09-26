import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useState, useRef, useEffect } from 'react'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $patchStyleText } from '@lexical/selection'

const PRESET_COLORS = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFA500',
  '#800080',
  '#FFC0CB',
  '#808080',
  '#964B00',
  '#40E0D0',
  '#FFD700',
  '#C71585'
]

const StrikethroughButton = () => {
  const [editor] = useLexicalComposerContext()
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const buttonRef = useRef(null)
  const colorPickerRef = useRef(null)
  const [isStrikethrough, setIsStrikethrough] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowColorPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          setIsStrikethrough(selection.hasFormat('strikethrough'))
        }
      })
    })
  }, [editor])

  const toggleStrikethrough = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const isStrikethroughNow = selection.hasFormat('strikethrough')
        selection.formatText('strikethrough')
        if (!isStrikethroughNow) {
          $patchStyleText(selection, {
            'text-decoration': `line-through ${selectedColor}`,
            'text-decoration-thickness': '2px'
          })
        } else {
          $patchStyleText(selection, {
            'text-decoration': '',
            'text-decoration-thickness': ''
          })
        }
      }
    })
  }

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (!selection.hasFormat('strikethrough')) {
          selection.formatText('strikethrough')
        }
        $patchStyleText(selection, {
          'text-decoration': `line-through ${color}`,
          'text-decoration-thickness': '2px'
        })
      }
    })
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          toggleStrikethrough()
          setShowColorPicker(!isStrikethrough)
        }}
        className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-1 ${
          isStrikethrough ? 'bg-gray-100' : ''
        }`}
        title="Strikethrough"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="w-5 h-5"
          style={{ color: selectedColor }}
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            fill="currentColor"
            d="M17.154 14c.23.516.346 1.09.346 1.72 0 1.342-.524 2.392-1.571 3.147C14.88 19.622 13.433 20 11.586 20c-1.64 0-3.263-.381-4.87-1.144V16.6c1.52.877 3.075 1.316 4.666 1.316 2.551 0 3.83-.732 3.839-2.197a2.21 2.21 0 0 0-.648-1.603l-.12-.117H3v-2h18v2h-3.846zm-4.078-3H7.629a4.086 4.086 0 0 1-.481-.522C6.716 9.92 6.5 9.246 6.5 8.452c0-1.236.466-2.287 1.397-3.153C8.83 4.433 10.271 4 12.222 4c1.471 0 2.879.328 4.222.984v2.152c-1.2-.687-2.515-1.03-3.946-1.03-2.48 0-3.719.782-3.719 2.346 0 .42.218.786.654 1.099.436.313.974.562 1.613.75.62.18 1.297.414 2.03.699z"
          />
        </svg>
        <div
          className="w-2 h-2 rounded-full border border-gray-300"
          style={{ backgroundColor: selectedColor }}
        />
      </button>

      {showColorPicker && (
        <div
          ref={colorPickerRef}
          className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          style={{ width: '200px' }}
        >
          <div className="grid grid-cols-4 gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  handleColorSelect(color)
                  setShowColorPicker(false)
                }}
                className="w-10 h-10 rounded-lg border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="mt-2 w-full h-8 cursor-pointer"
          />
        </div>
      )}
    </div>
  )
}

export default StrikethroughButton
