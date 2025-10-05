import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $patchStyleText } from '@lexical/selection'
import { useState, useCallback } from 'react'

const FONT_SIZES = {
  'text-xs': '12px',
  'text-sm': '14px',
  'text-base': '16px',
  'text-lg': '18px',
  'text-xl': '20px',
  'text-2xl': '24px',
  'text-3xl': '30px',
  'text-4xl': '36px'
}

const FontSizeDropdown = () => {
  const [editor] = useLexicalComposerContext()
  const [currentSize, setCurrentSize] = useState('text-base')

  const handleChange = useCallback(
    (e) => {
      const fontSize = e.target.value
      setCurrentSize(fontSize)

      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            'font-size': FONT_SIZES[fontSize]
          })
        }
      })
    },
    [editor]
  )

  return (
    <select
      className="h-10 px-2 py-1 border-2 rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-500 dark:hover:border-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none min-w-[80px] transition-colors"
      title="Font Size"
      onChange={handleChange}
      value={currentSize}
    >
      {Object.entries(FONT_SIZES).map(([className, size]) => (
        <option key={className} value={className} className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          {size}
        </option>
      ))}
    </select>
  )
}

export default FontSizeDropdown
